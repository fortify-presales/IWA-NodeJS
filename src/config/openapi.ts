import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: `${env.appName} API`,
      version: env.appVersion,
      description: 'REST API for IWA Pharmacy Direct (intentionally vulnerable demo app)',
    },
    servers: [{ url: '/api/v3' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/api/v3/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
