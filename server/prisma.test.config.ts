import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Read only the test environment file.
const testEnvironment = parse(
    readFileSync(new URL('./.env.test', import.meta.url)),
);

const password = testEnvironment.TEST_MIGRATOR_DATABASE_PASSWORD;

if (!password) {
    throw new Error('TEST_MIGRATOR_DATABASE_PASSWORD is required');
}

// Fixed test host, port, database, and role.
// Encode the password so special characters work in the URL.
const databaseUrl =
    `postgresql://homehub_migrator:${encodeURIComponent(password)}` +
    '@127.0.0.1:5434/homehub_test?schema=public';

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        url: databaseUrl,
    },
});