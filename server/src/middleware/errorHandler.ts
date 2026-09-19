import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { InvalidAdminSetupError } from '../setup/setup-errors.js';

// Create error handler for HTTP level errors
function isMalformedJsonError(error: any) {
  return (
    error instanceof SyntaxError &&
    (error as any).status === 400 &&
    (error as any).type === 'entity.parse.failed'
  );
}

function isPayloadToLarge(error: any) {
  return (error as any).status === 413 && (error as any).type === 'entity.too.large';
}

// next: delegates if response headers were already sent.
// headersSent: prevents trying to start a second response after part of one was transmitted.
function errorHandler(error: any, request: Request, response: Response, next: NextFunction) {
  if (response.headersSent) {
    return next(error);
  }

  if (isMalformedJsonError(error)) {
    return response.status(400).json({
      ok: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Request body must contain valid JSON.',
      },
    });
  }

  if (isPayloadToLarge(error)) {
    return response.status(413).json({
      ok: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request body exceeds the 16 KB limit.',
      },
    });
  }

  if (error instanceof ZodError) {
    return response.status(400).json({
      ok: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Request data is invalid.',
      },
    });
  }

  if (error instanceof InvalidAdminSetupError) {
    return response.status(401).json({
      ok: false,
      error: {
        code: 'INVALID_ADMIN_SETUP',
        message: 'Admin setup could not be completed.',
      },
    });
  }

  console.error('Unhandled request error.');

  return response.status(500).json({
    ok: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
    },
  });
}

export { errorHandler };
