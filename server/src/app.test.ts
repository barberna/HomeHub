import request from 'supertest';
import { createApp } from './app.ts';
import { describe, expect, it, vi } from 'vitest';

// Prevent authentication initialization from loading Prisma and email.
vi.mock('./lib/auth.js', () => ({
  auth: {},
}));

// Supply an Express-compatible handler for the mocked authentication.
vi.mock('better-auth/node', () => ({
  toNodeHandler: () =>
    (
      _req: unknown,
      _res: unknown,
      next: () => void,
    ) => next(),
}));

// Prevent setup routes from loading their database dependencies.
vi.mock('./setup/setup-router.js', async () => {
  const { Router } = await import('express');

  return {
    setupRouter: Router(),
  };
});

describe('GET /api/health', () => {
  it('returns healthy API response', async () => {
    const response = await request(createApp()).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      data: {
        status: 'healthy',
      },
    });
  });
});