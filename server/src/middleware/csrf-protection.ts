import type { NextFunction, Request, Response } from 'express';

const SAFE_HTTP_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/*
What it does:
- Allows safe read-only requests such as GET /me.
- Requires state-changing requests to contain X-CSRF-Protection: 1.
- Rejects requests the browser identifies as coming from another site.
- Returns 403 Forbidden when verification fails.
*/
// This rejects state-changing requests when the origin is missing, untrusted, or configuration is missing. Use exact equality,

function requireCsrfProtection(request: Request, response: Response, next: NextFunction) {
  if (SAFE_HTTP_METHODS.has(request.method)) {
    return next();
  }

  const csrfHeader = request.get('X-CSRF-Protection');
  const fetchSite = request.get('Sec-Fetch-Site');
  const requestOrigin = request.get('Origin');
  const allowedOrigin = process.env.CLIENT_ORIGIN;

  if (
    csrfHeader !== '1' ||
    fetchSite === 'cross-site' ||
    !allowedOrigin ||
    !requestOrigin ||
    requestOrigin === 'null' ||
    requestOrigin !== allowedOrigin
  ) {
    return response.status(403).json({
      ok: false,
      error: {
        code: 'CSRF_VALIDATION_FAILED',
        message: 'Request could not be verified.',
      },
    });
  }

  return next();
}

export { requireCsrfProtection };
