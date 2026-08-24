import 'reflect-metadata';
import fs from 'fs';
import { sequelize } from './config/database.js';
import { seed } from './config/seed.js';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

// Ensure required directories exist
['./data', './logs', env.uploadDir, './data/restore'].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

async function bootstrap() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established');

    await sequelize.sync({ force: true });
    logger.info('Database synchronized');

    await seed();

    const app = createApp();
    app.listen(env.port, () => {
      logger.info(`${env.appName} v${env.appVersion} running on port ${env.port} [${env.nodeEnv}]`);
      logger.info(`Swagger UI: http://localhost:${env.port}/swagger-ui`);
    });
  } catch (err) {
    logger.error(`Bootstrap failed: ${err}`);
    process.exit(1);
  }
}

bootstrap();
