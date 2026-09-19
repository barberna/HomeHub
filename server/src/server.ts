import { environment } from './config/environment.js';
import { createApp } from './app.js';
import { prisma } from './lib/prisma.js';

const app = createApp();

const { apiPort, apiHost } = environment;

const httpServer = app.listen(apiPort, apiHost, () => {
  console.log(`API listening at http://${apiHost}:${apiPort}`);
});

let isShuttingDown = false;

function shutdown(signal: 'SIGINT' | 'SIGTERM') {
  if (isShuttingDown) return;

  isShuttingDown = true;
  console.log(`Received ${signal}; starting graceful shutdown.`);

  // Prevent a stuck request or database operation from hanging shutdown.
  const shutdownTimeout = setTimeout(() => {
    console.error('Shutdown timed out; forcing exit.');
    process.exit(1);
  }, 10_000);

  // The timer alone should not keep the process alive.
  shutdownTimeout.unref();

  httpServer.close(async (httpError) => {
    if (httpError) {
      console.error('HTTP server shutdown failed.');
      process.exitCode = 1;
    }

    try {
      await prisma.$disconnect();
      clearTimeout(shutdownTimeout);

      if (!httpError) {
        console.log('Graceful shutdown complete.');
      }
    } catch {
      console.error('Database shutdown failed.');
      process.exitCode = 1;
      // Keep the timeout available if database resources remain open.
    }
  });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
