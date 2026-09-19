import { rateLimit } from 'express-rate-limit'
import type { Request, Response} from 'express';


const ONE_HOUR_IN_MILLISECONDS = 60 * 60 * 1000

function sendRateLimitResponse(_request: Request, response: Response) {
    return response.status(429).json({
        ok: false,
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many attempts. Please try again later.',
        },
    })
}

export function createRegistrationRateLimiter({
    windowMs = ONE_HOUR_IN_MILLISECONDS,
    limit = 5,
} = {}) {
    return rateLimit({
        windowMs,
        limit,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        handler: sendRateLimitResponse,
    })
}

export const registrationRateLimiter = createRegistrationRateLimiter()



