import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';
import { Client } from 'pg';
import { afterAll, expect, it } from 'vitest';
import { prisma } from '../../src/lib/prisma.js';
import { adminSetup } from '../../src/setup/setup-service.js';

afterAll(async () => {
    await prisma.$disconnect();
});

it('rolls back admin creation when completing setup fails', async () => {
    // Refuse to run against the normal database.
    expect(process.env.HOMEHUB_INTEGRATION_TEST).toBe('1');

    const url = new URL(process.env.DATABASE_URL ?? '');
    expect(url.hostname).toBe('127.0.0.1');
    expect(url.port).toBe('5434');
    expect(url.pathname).toBe('/homehub_test');

    const identity = await prisma.$queryRaw<
        Array<{ database: string; role: string }>
    >`
        SELECT current_database() AS database,
               current_user AS role
    `;

    expect(identity[0]).toEqual({
        database: 'homehub_test',
        role: 'homehub_app',
    });

    const setupSecret = process.env.SETUP_SECRET;
    if (!setupSecret) {
        throw new Error('Test SETUP_SECRET is missing');
    }

    // Require an unused test database; don't erase existing data.
    expect(await prisma.user.count()).toBe(0);
    expect(await prisma.account.count()).toBe(0);

    const initialState = await prisma.setupState.findUnique({
        where: { id: 1 },
    });

    expect(initialState).not.toBeNull();
    expect(initialState?.completedAt).toBeNull();

    const testEnvironment = parse(
        readFileSync(new URL('../../.env.test', import.meta.url)),
    );

    const password = testEnvironment.TEST_MIGRATOR_DATABASE_PASSWORD;
    if (!password) {
        throw new Error('Test migrator password is missing');
    }

    // Only this connection can install/remove the test trigger.
    const control = new Client({
        host: '127.0.0.1',
        port: 5434,
        database: 'homehub_test',
        user: 'homehub_migrator',
        password,
        connectionTimeoutMillis: 3000,
        statement_timeout: 5000,
    });

    await control.connect();

    try {
        const controlIdentity = await control.query(
            'SELECT current_database() AS database, current_user AS role',
        );

        expect(controlIdentity.rows[0]).toEqual({
            database: 'homehub_test',
            role: 'homehub_migrator',
        });

        await control.query(`
            CREATE FUNCTION public.test_reject_setup_completion()
            RETURNS trigger
            LANGUAGE plpgsql
            AS $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM public."user" AS u
                    JOIN public."account" AS a ON a."userId" = u.id
                    WHERE u.email = 'rollback-test@example.com'
                      AND u.role = 'admin'
                      AND a."providerId" = 'credential'
                      AND a.password IS NOT NULL
                ) THEN
                    RAISE EXCEPTION 'ROLLBACK_TEST_MISSING_CREATION';
                END IF;

                RAISE EXCEPTION 'ROLLBACK_TEST_AFTER_CREATION';
            END;
            $$;
        `);

        try {
            await control.query(`
                CREATE TRIGGER test_reject_setup_completion
                BEFORE UPDATE OF "completedAt"
                ON public."setupState"
                FOR EACH ROW
                WHEN (NEW."completedAt" IS NOT NULL)
                EXECUTE FUNCTION public.test_reject_setup_completion();
            `);

            await expect(
                adminSetup(prisma, {
                    setupSecret,
                    name: 'Rollback Test',
                    email: 'rollback-test@example.com',
                    password: 'Rollback-test-only-password-2026!',
                }),
            ).rejects.toThrow('ROLLBACK_TEST_AFTER_CREATION');

            // The attempted inserts must not remain after rollback.
            expect(await prisma.user.count()).toBe(0);
            expect(await prisma.account.count()).toBe(0);

            const finalState = await prisma.setupState.findUnique({
                where: { id: 1 },
            });

            expect(finalState).toEqual(initialState);
        } finally {
            // Remove only the test objects, even if an assertion fails.
            await control.query(`
                DROP TRIGGER IF EXISTS test_reject_setup_completion
                ON public."setupState";
            `);

            await control.query(`
                DROP FUNCTION IF EXISTS public.test_reject_setup_completion();
            `);
        }
    } finally {
        await control.end();
    }
});

/*
The test uses two database connections: the app role runs real setup, while the migrator role installs the deliberate failure. Both connect only to homehub_test on port 5434.

That config reads .env.test and gets:
TEST_APP_DATABASE_PASSWORD

It builds the test database URL and supplies it to the test process as DATABASE_URL. It also supplies temporary SETUP_SECRET and BETTER_AUTH_SECRET values.

The resulting Prisma client connects as homehub_app. This means the test exercises the same restricted database permissions as your real application.

3. The test verifies its starting conditions:
Before modifying anything, it checks:
- The test-mode marker is present.
- The connection targets port 5434 and homehub_test.
- PostgreSQL confirms the database and role.
- No users or credential accounts exist.
- The setup-state row exists and is unfinished.
These checks prevent an unrelated starting-state problem from looking like successful rollback.


4. A second connection installs the failure
The test reads .env.test again, this time using:
TEST_MIGRATOR_DATABASE_PASSWORD
That creates the control connection as homehub_migrator, which owns the migrated tables and can install the test trigger.
The trigger says:
When setup’s completion timestamp is updated, first verify that the admin and credential account exist, then raise ROLLBACK_TEST_AFTER_CREATION.

The bootstrap password isn’t used here—it was used when initializing the Docker database.


5. The real setup service runs
await adminSetup(prisma, input);
Nothing here is mocked. Your service:
1. Validates the setup secret.
2. Starts a real transaction and locks the setup row.
3. Checks that setup is allowed.
4. Uses Better Auth to create the admin and hashed-password account.
5. Attempts to mark setup complete.
That fifth step activates the trigger.
The trigger can see the new records because it runs inside the same transaction, even though those records haven’t been committed yet.


6. The intentional error causes rollback
The trigger throws the expected error. It propagates out of the transaction callback, so Prisma rolls back the transaction.
The test then makes fresh database queries and confirms:
user count === 0
account count === 0
final setup state === initial setup state
Checking only that an error occurred would not prove rollback. Checking the database afterward does.



7. Cleanup removes the test machinery
The finally blocks remove the trigger and trigger function, then close the control connection. afterAll() disconnects Prisma.
Cleanup does not delete the admin records to make the assertions pass. Their absence is the result of the rollback itself.
So your passing test demonstrates that a failure at the final setup update undoes the earlier Better Auth account creation, leaving setup unfinished.
*/