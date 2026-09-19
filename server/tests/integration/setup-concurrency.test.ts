import { randomUUID } from 'node:crypto';
import { afterAll, expect, it } from 'vitest';
import { prisma } from '../../src/lib/prisma.js';
import { adminSetup } from '../../src/setup/setup-service.js';
import { InvalidAdminSetupError } from '../../src/setup/setup-errors.js';

afterAll(async () => {
    await prisma.$disconnect();
});

/*
What the important parts do
- Different emails: prevents an email uniqueness constraint from being the reason the second attempt fails.
- Promise.allSettled: waits for both attempts to finish, including the rejected one. Cleanup must not begin while another attempt is still running.
- InvalidAdminSetupError: checks that the losing attempt was rejected by your setup rules—not an unrelated database error.
- finally: restores this isolated test database for your next run. Never use this cleanup logic in a production setup route.
Each setup call must keep its own transaction. Putting both calls inside a single transaction would not model two independent requests.
*/

it('allows only one of two concurrent initial-admin attempts', async () => {
    // 1. Refuse to modify the normal database.
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

    // 2. Require an unused test database.
    // These checks happen before entering the cleanup block.
    expect(await prisma.user.count()).toBe(0);
    expect(await prisma.account.count()).toBe(0);

    const initialState = await prisma.setupState.findUnique({
        where: { id: 1 },
    });

    expect(initialState).not.toBeNull();
    expect(initialState?.completedAt).toBeNull();

    // Unique addresses identify records created by THIS test run.
    const runId = randomUUID();
    const emails = [
        `concurrency-a-${runId}@example.com`,
        `concurrency-b-${runId}@example.com`,
    ];

    try {
        // 3. Start both attempts without awaiting either individually.
        // Each adminSetup call opens its own transaction.
        const results = await Promise.allSettled(
            emails.map((email) =>
                adminSetup(prisma, {
                    setupSecret,
                    name: 'Concurrency Test',
                    email,
                    password: 'Concurrency-test-only-password-2026!',
                }),
            ),
        );

        // 4. Exactly one must succeed and one must reject.
        const successes = results.filter(
            (result) => result.status === 'fulfilled',
        );

        const failures = results.filter(
            (result) => result.status === 'rejected',
        );

        expect(successes).toHaveLength(1);
        expect(failures).toHaveLength(1);

        const success = successes[0];
        const failure = failures[0];

        // Also narrows the types for TypeScript.
        if (
            !success || success.status !== 'fulfilled' ||
            !failure || failure.status !== 'rejected'
        ) {
            throw new Error('Unexpected setup results');
        }

        expect(failure.reason).toBeInstanceOf(InvalidAdminSetupError);

        // 5. Check what actually persisted—not only returned values.
        const users = await prisma.user.findMany({
            select: { id: true, email: true, role: true },
        });

        expect(users).toHaveLength(1);
        expect(users[0]?.id).toBe(success.value.userId);
        expect(users[0]?.role).toBe('admin');
        expect(emails).toContain(users[0]?.email);

        const accounts = await prisma.account.findMany({
            select: { userId: true, providerId: true },
        });

        expect(accounts).toEqual([
            {
                userId: success.value.userId,
                providerId: 'credential',
            },
        ]);

        const finalState = await prisma.setupState.findUnique({
            where: { id: 1 },
        });

        expect(finalState?.completedAt).toBeInstanceOf(Date);
    } finally {
        // 6. Clean up only this run's users, even if an assertion fails.
        await prisma.$transaction(async (tx) => {
            const unrelatedUsers = await tx.user.count({
                where: { email: { notIn: emails } },
            });

            if (unrelatedUsers !== 0) {
                throw new Error(
                    'Cleanup refused: unexpected users exist in the test database',
                );
            }

            // Your schema cascades deletion to accounts and sessions.
            await tx.user.deleteMany({
                where: { email: { in: emails } },
            });

            // Restore the initially unfinished setup state.
            await tx.setupState.update({
                where: { id: 1 },
                data: { completedAt: null },
            });
        });
    }
});