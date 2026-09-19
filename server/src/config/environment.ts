import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  API_PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  API_HOST: z.string().trim().min(1).default('127.0.0.1'),
});

const result = environmentSchema.safeParse(process.env);

if (!result.success) {
  const invalidFields = result.error.issues.map(
    // join('.') combines a nested path using periods: ['API_PORT'].join('.')             // "API_PORT"
    (issue) => issue.path.join('.') || 'environment',
  );

  console.error('Invalid environment configuration', {
    invalidFields,
  });

  //Throwing stops this module from finishing. Because server.js will import this module during startup, the server will not begin listening.
  throw new Error('Invalid environment configuration');
}

const environment = Object.freeze({
  nodeEnv: result.data.NODE_ENV,
  apiPort: result.data.API_PORT,
  apiHost: result.data.API_HOST,
});

export { environment };
