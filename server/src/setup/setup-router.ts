import express from 'express';
import { adminSetup, checkStatus } from './setup-service.js';
import { requireCsrfProtection } from '../middleware/csrf-protection.js';
import { prisma } from '../lib/prisma.js';
import { setupInputSchema } from './setup-input.js';
import { registrationRateLimiter } from './setup-rate-limiter.js';

const setupRouter = express.Router();

setupRouter.use(requireCsrfProtection);

setupRouter.get('/status', async (_request, response) => {
  // This adds an HTTP response header telling browsers and other HTTP caches not to store this response for reuse.
  // You don’t want the browser reusing an old true response after setup has finished.
  response.set('Cache-Control', 'no-store');

  const status = await checkStatus(prisma);

  return response.status(200).json({
    ok: true,
    data: status,
  });
});

setupRouter.post('/complete', registrationRateLimiter, async (request, response) => {
  const input = setupInputSchema.parse(request.body);

  const user = await adminSetup(prisma, input);

  return response.status(201).json({
    ok: true,
    data: {
      userId: user.userId,
    },
  });
});

export { setupRouter };
