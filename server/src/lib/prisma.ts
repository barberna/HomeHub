import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

// prisma.ts prepares database access;
// auth.ts configures authentication to use it.

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

// PrismaPg connects Prisma to PostgreSQL through the pg driver.
// this constructs the PostgreSQL adapter with those connection details.
const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

// This creates and exports a reusable client. { adapter } is JavaScript shorthand for { adapter: adapter }.
export const prisma = new PrismaClient({ adapter });
