import 'dotenv/config';
import app from './app';
import connectDB from './config/db';
import { verifyEmailConnection } from './services/email.service';
import logger from './utils/logger';

const PORT = Number(process.env.PORT) || 5000;

const bootstrap = async () => {
  await connectDB();
  await verifyEmailConnection();

  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled rejection:', err);
    server.close(() => process.exit(1));
  });
};

bootstrap();
