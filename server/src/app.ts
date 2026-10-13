import express from 'express';
import helmet from 'helmet';
import { environment } from './config/environment.js';
import { errorHandler } from './middleware/errorHandler.js';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import { setupRouter } from './setup/setup-router.js';
import jellyfinRouter from './routes/jellyfin-router.js';
import { createProxyMiddleware } from 'http-proxy-middleware';

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

  // Keep the streaming proxy before body parsers so proxied request bodies remain untouched.
  app.use(
    '/api/jellyfin-stream',
    createProxyMiddleware({
      target: process.env.JELLYFIN_URL || 'http://localhost:8096',
      changeOrigin: true,
      pathRewrite: {
        '^/api/jellyfin-stream': '',
      },
      on: {
        proxyReq: (proxyReq) => {
          if (process.env.JELLYFIN_API_KEY) {
            proxyReq.setHeader(
              'authorization',
              `MediaBrowser Token="${process.env.JELLYFIN_API_KEY}"`,
            );
          }
        },
      },
    }),
  );

  app.use(
    express.json({
      limit: '16kb',
    }),
  );

  app.use('/api/setup', setupRouter);
  app.use('/api/jellyfin', jellyfinRouter);

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
