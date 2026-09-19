import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { parse } from 'dotenv';
import { defineConfig } from 'vitest/config';

/*
vitest.integration.config.ts tells Vitest how to run your real-database tests safely and separately from your regular tests. It configures the test environment—it isn’t itself a test.

In your setup, it:
- Reads .env.test to obtain the test application database password.
- Builds the test DATABASE_URL pointing to homehub_test on 127.0.0.1:5434, using homehub_app.
- Provides environment variables such as temporary Better Auth and setup secrets. Your application code reads these through process.env during testing.
- Selects integration tests using tests/integration/**.test.ts.
- Disables parallel test-file execution, so these files don’t run simultaneously against the shared test database.
- Allows 15 seconds for tests and hooks, giving real database operations more time.

*/


const testEnvironment = parse(
    readFileSync(new URL('./.env.test', import.meta.url)),
);

const password = testEnvironment.TEST_APP_DATABASE_PASSWORD;

if (!password) {
    throw new Error('TEST_APP_DATABASE_PASSWORD is required');
}

const databaseUrl =
    `postgresql://homehub_app:${encodeURIComponent(password)}` +
    '@127.0.0.1:5434/homehub_test?schema=public';

export default defineConfig({
    envDir: false,
    test: {
        environment: 'node',
        globals: false,
        include: ['tests/integration/**/*.test.ts'],
        setupFiles: ['./tests/integration/mock-email.ts'],
        fileParallelism: false,
        testTimeout: 15_000,
        hookTimeout: 15_000,

        env: {
            NODE_ENV: 'test',
            HOMEHUB_INTEGRATION_TEST: '1',
            DATABASE_URL: databaseUrl,
            CLIENT_ORIGIN: 'http://localhost:5173',
            BETTER_AUTH_URL: 'http://localhost:3000',
            BETTER_AUTH_SECRET: randomBytes(32).toString('hex'),
            SETUP_SECRET: randomBytes(32).toString('base64url'),
        },
    },
});
