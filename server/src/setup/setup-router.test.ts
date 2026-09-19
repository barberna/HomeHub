import { describe, expect, it, vi, afterEach } from 'vitest';
import express, { response } from 'express';
import request from 'supertest';

// Replace the service so its real database code never runs.
vi.mock('./setup-service.js', () => ({
  checkStatus: vi.fn(),
  adminSetup: vi.fn(),
}));

vi.mock('../lib/prisma.js', () => ({
  prisma: {},
}));

import { setupRouter } from './setup-router.js';
import { checkStatus, adminSetup } from './setup-service.js';
import { prisma } from '../lib/prisma.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { InvalidAdminSetupError } from './setup-errors.js';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

describe('GET /api/setup/status', () => {
  it(' returns setup availibilty without caching', async () => {
    vi.mocked(checkStatus).mockResolvedValueOnce({
      setupAvailable: true,
    });

    const app = express();

    app.use(express.json());

    app.use('/api/setup', setupRouter);

    const response = await request(app).get('/api/setup/status');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      data: {
        setupAvailable: true,
      },
    });
    expect(response.headers['cache-control']).toBe('no-store');
    expect(checkStatus).toHaveBeenCalledWith(prisma);
  });

  it('returns setup unavailibility without caching', async () => {
    vi.mocked(checkStatus).mockResolvedValueOnce({
      setupAvailable: false,
    });

    const app = express();

    app.use(express.json());

    app.use('/api/setup', setupRouter);

    const response = await request(app).get('/api/setup/status');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      data: {
        setupAvailable: false,
      },
    });
    expect(response.headers['cache-control']).toBe('no-store');
    expect(checkStatus).toHaveBeenCalledWith(prisma);
  });
});

describe(' POST /api/status/complete', () => {
  it('verify returns 201 wehn admin is setup sucessfully', async () => {
    vi.stubEnv('CLIENT_ORIGIN', 'http://localhost:5173');

    const input = {
      setupSecret: 'a'.repeat(43),
      name: 'test',
      email: 'test@example.com',
      password: 'Test-only-password',
    };

    vi.mocked(adminSetup).mockResolvedValueOnce({
      userId: 'Test-admin-id',
    });

    const app = express();

    app.use(express.json());

    app.use('/api/setup', setupRouter);

    const response = await request(app)
      .post('/api/setup/complete')
      // These headers simulate a request from your frontend:
      // Origin: http://localhost:5173 — matches the frontend address allowed by your middleware.
      // X-CSRF-Protection: 1 — satisfies your custom-header requirement.
      // Sec-Fetch-Site: same-origin — simulates the browser reporting a same-origin request, as with your frontend’s /api proxy.
      .set('Origin', 'http://localhost:5173')
      .set('X-CSRF-Protection', '1')
      .set('Sec-Fetch-Site', 'same-origin')
      .send(input);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ok: true,
      data: {
        userId: 'Test-admin-id',
      },
    });
    expect(adminSetup).toHaveBeenCalledTimes(1);
    expect(adminSetup).toHaveBeenCalledWith(prisma, input);
  });

  it('Verify that missing securty headers return 403', async () => {
    vi.stubEnv('CLIENT_ORIGIN', 'http://localhost:5173');

    const input = {
      setupSecret: 'a'.repeat(43),
      name: 'test',
      email: 'test@example.com',
      password: 'Test-only-password',
    };

    vi.mocked(adminSetup).mockResolvedValueOnce({
      userId: 'Test-admin-id',
    });

    const app = express();

    app.use(express.json());

    app.use('/api/setup', setupRouter);

    const response = await request(app)
      .post('/api/setup/complete')
      // These headers simulate a request from your frontend:
      // Origin: http://localhost:5173 — matches the frontend address allowed by your middleware.
      // X-CSRF-Protection: 1 — satisfies your custom-header requirement.
      // Sec-Fetch-Site: same-origin — simulates the browser reporting a same-origin request, as with your frontend’s /api proxy.
      .set('Origin', 'http://localhost:5173')
      .set('X-CSRF-Protection', '')
      .set('Sec-Fetch-Site', 'same-origin')
      .send(input);

    expect(response.status).toBe(403);
    expect(adminSetup).toHaveBeenCalledTimes(0);
  });

  it('Verify that untrusted origin return 403', async () => {
    vi.stubEnv('CLIENT_ORIGIN', 'http://localhost:5173');

    const input = {
      setupSecret: 'a'.repeat(43),
      name: 'test',
      email: 'test@example.com',
      password: 'Test-only-password',
    };

    vi.mocked(adminSetup).mockResolvedValueOnce({
      userId: 'Test-admin-id',
    });

    const app = express();

    app.use(express.json());

    app.use('/api/setup', setupRouter);

    const response = await request(app)
      .post('/api/setup/complete')
      // These headers simulate a request from your frontend:
      // Origin: http://localhost:5173 — matches the frontend address allowed by your middleware.
      // X-CSRF-Protection: 1 — satisfies your custom-header requirement.
      // Sec-Fetch-Site: same-origin — simulates the browser reporting a same-origin request, as with your frontend’s /api proxy.
      .set('Origin', 'http://localhost:4000')
      .set('X-CSRF-Protection', '1')
      .set('Sec-Fetch-Site', 'same-origin')
      .send(input);

    expect(response.status).toBe(403);
    expect(adminSetup).toHaveBeenCalledTimes(0);
  });

  it('Verify that missing origin return 403', async () => {
    vi.stubEnv('CLIENT_ORIGIN', 'http://localhost:5173');

    const input = {
      setupSecret: 'a'.repeat(43),
      name: 'test',
      email: 'test@example.com',
      password: 'Test-only-password',
    };

    vi.mocked(adminSetup).mockResolvedValueOnce({
      userId: 'Test-admin-id',
    });

    const app = express();

    app.use(express.json());

    app.use('/api/setup', setupRouter);

    const response = await request(app)
      .post('/api/setup/complete')
      // These headers simulate a request from your frontend:
      // Origin: http://localhost:5173 — matches the frontend address allowed by your middleware.
      // X-CSRF-Protection: 1 — satisfies your custom-header requirement.
      // Sec-Fetch-Site: same-origin — simulates the browser reporting a same-origin request, as with your frontend’s /api proxy.
      .set('X-CSRF-Protection', '1')
      .set('Sec-Fetch-Site', 'same-origin')
      .send(input);

    expect(response.status).toBe(403);
    expect(adminSetup).toHaveBeenCalledTimes(0);
  });

  it('verify incorrect setup secret throws 401 error', async () => {
    vi.stubEnv('CLIENT_ORIGIN', 'http://localhost:5173');

    const input = {
      setupSecret: 'a'.repeat(42),
      name: 'test',
      email: 'test@example.com',
      password: 'Test-only-password',
    };

    vi.mocked(adminSetup).mockResolvedValueOnce({
      userId: 'Test-admin-id',
    });

    const app = express();

    app.use(express.json());

    app.use('/api/setup', setupRouter);

    app.use(errorHandler);

    const response = await request(app)
      .post('/api/setup/complete')
      .set('Origin', 'http://localhost:5173')
      .set('X-CSRF-Protection', '1')
      .set('Sec-Fetch-Site', 'same-origin')
      .send(input);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      ok: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Request data is invalid.',
      },
    });
    expect(adminSetup).toHaveBeenCalledTimes(0);
  });

  it('Verify that incomplete setup state throws 403 error', async () => {
    vi.stubEnv('CLIENT_ORIGIN', 'http://localhost:5173');

    const input = {
      setupSecret: 'a'.repeat(43),
      name: 'test',
      email: 'test@example.com',
      password: 'Test-only-password',
    };

    vi.mocked(adminSetup).mockRejectedValueOnce(new InvalidAdminSetupError());

    const app = express();

    app.use(express.json());

    app.use('/api/setup', setupRouter);

    app.use(errorHandler);

    const response = await request(app)
      .post('/api/setup/complete')
      .set('Origin', 'http://localhost:5173')
      .set('X-CSRF-Protection', '1')
      .set('Sec-Fetch-Site', 'same-origin')
      .send(input);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      ok: false,
      error: {
        code: 'INVALID_ADMIN_SETUP',
        message: 'Admin setup could not be completed.',
      },
    });
    expect(adminSetup).toHaveBeenCalledOnce();
  });
});
