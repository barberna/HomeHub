import express from 'express'
import request from 'supertest'
import { describe, expect, test, vi } from 'vitest'
import { createRegistrationRateLimiter } from './setup-rate-limiter.js'

describe('Admin register rate limiter', () => {
    test('blocks the sixth request when the limit is five', async () => {
        const app = express()

        const loginRateLimiter = createRegistrationRateLimiter({
            windowMs: 60 * 1000,
            limit: 5,
        })

        const routeHandler = vi.fn(
            (_request: express.Request, response: express.Response) => {
                return response.status(401).json({ ok: false });
            },
        );

        app.post('/complete', loginRateLimiter, routeHandler);

        const firstResponse = await request(app).post('/complete')
        const secondResponse = await request(app).post('/complete')
        const thirdResponse = await request(app).post('/complete')
        const fourthResponse = await request(app).post('/complete')
        const fithResponse = await request(app).post('/complete')

        expect(routeHandler).toHaveBeenCalledTimes(5);

        const sixthResponse = await request(app).post('/complete')

        expect(routeHandler).toHaveBeenCalledTimes(5);

        expect(firstResponse.status).toBe(401)
        expect(secondResponse.status).toBe(401)
        expect(thirdResponse.status).toBe(401)
        expect(fourthResponse.status).toBe(401)
        expect(fithResponse.status).toBe(401)

        expect(sixthResponse.status).toBe(429)
        expect(sixthResponse.body).toEqual({
            ok: false,
            error: {
                code: 'TOO_MANY_REQUESTS',
                message: 'Too many attempts. Please try again later.',
            },
        })

        expect(sixthResponse.headers.ratelimit).toBeDefined()
        expect(
            sixthResponse.headers['ratelimit-policy'],
        ).toBeDefined()
    })
})