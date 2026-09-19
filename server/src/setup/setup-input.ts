import { z } from 'zod';

// This checks the request’s shape and rejects unexpected properties such as role

export const setupInputSchema = z
  .object({
    setupSecret: z.string().regex(/^[A-Za-z0-9_-]{43}$/),

    name: z.string().trim().min(1).max(100),

    email: z.string().trim().email().max(128),

    password: z.string().min(10).max(128),
  })
  .strict();

export type SetupInput = z.infer<typeof setupInputSchema>;
