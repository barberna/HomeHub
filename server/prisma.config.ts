import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';
import { fileURLToPath } from 'node:url';

config({
  path: fileURLToPath(new URL('../database/.env', import.meta.url)),
});

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('MIGRATION_DATABASE_URL'),
  },
});
