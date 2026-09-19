import request from 'supertest';
import { createApp } from './app.ts';
import { describe, expect, it } from 'vitest';

describe('GET /api/health', () => {
  it('returns healthy API response', async () => {
    const app = createApp();

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
  });
});
