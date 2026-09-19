import { z } from 'zod';

const databaseEnvironmentSchema = z.object({
  DATABASE_HOST: z.string().trim().min(1),

  DATABASE_PORT: z.coerce.number().int().min(0).max(65535),

  DATABASE_NAME: z.string().trim().min(1),

  DATABASE_USER: z.literal('auth_app'),

  DATABASE_PASSWORD: z.string().min(32),
});

const result = databaseEnvironmentSchema.safeParse(process.env);

if (!result.success) {
  const invalidFields = result.error.issues.map((issue) => issue.path.join('.') || 'environment');

  console.error('Invalid environment configuration', {
    invalidFields,
  });

  //Throwing stops this module from finishing. Because server.ts will import this module during startup, the server will not begin listening.
  throw new Error('Invalid environment configuration');
}

const databaseEnvironment = Object.freeze({
  databaseHost: result.data.DATABASE_HOST,
  databasePort: result.data.DATABASE_PORT,
  databaseName: result.data.DATABASE_NAME,
  databaseUser: result.data.DATABASE_USER,
  databasePassword: result.data.DATABASE_PASSWORD,
});

export { databaseEnvironment };
