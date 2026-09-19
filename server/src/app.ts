import express from 'express';
import helmet from 'helmet';
import { environment } from './config/environment.js';
import { errorHandler } from './middleware/errorHandler.js';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import { setupRouter } from './setup/setup-router.js';

function createApp() {
  const app = express();

  const isProduction = environment.nodeEnv === 'production';

  const securityHeaders = isProduction
    ? helmet()
    : helmet({
        strictTransportSecurity: false,
        contentSecurityPolicy: {
          directives: {
            'upgrade-insecure-requests': null,
          },
        },
      });

  // removes an unnecessary response header advertising Express.
  app.disable('x-powered-by');

  app.use(securityHeaders);

  app.all('/api/auth/*splat', toNodeHandler(auth));

  app.use(
    express.json({
      limit: '16kb',
    }),
  );

  app.use('/api/setup', setupRouter);

  app.get('/api/health', (request, response) => {
    response.status(200).json({
      ok: true,
      data: {
        status: 'healthy',
      },
    });
  });

  app.use((_request, response) => {
    response.status(404).json({
      ok: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'The requested resource was not found.',
      },
    });
  });

  app.use(errorHandler);

  return app;
}

export { createApp };
