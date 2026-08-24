import 'reflect-metadata';
import path from 'path';
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import { configureSecurity } from './config/security.js';
import { configurePassport } from './config/passport.js';
import { swaggerSpec } from './config/openapi.js';
import { env } from './config/env.js';
import { requestLogger } from './middleware/requestLogger.js';
import { locals } from './middleware/locals.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiErrorHandler } from './middleware/apiErrorHandler.js';
import { siteRouter } from './api/v3/site.js';
import { usersRouter } from './api/v3/users.js';
import { productsRouter } from './api/v3/products.js';
import { ordersRouter } from './api/v3/orders.js';
import { messagesRouter } from './api/v3/messages.js';
import { reviewsRouter } from './api/v3/reviews.js';
import { rolesRouter } from './api/v3/roles.js';
import { defaultRouter } from './web/default.js';
import { productsWebRouter } from './web/products.js';
import { cartRouter } from './web/cart.js';
import { userRouter } from './web/user.js';
import { userPublicRouter } from './web/userPublic.js';
import { adminRouter } from './web/admin/index.js';

export function createApp() {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.resolve('views'));
  app.set('layout', 'layouts/main');
  app.use(expressLayouts);

  app.use(requestLogger);
  configureSecurity(app);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // INSECURE: no CSRF middleware (CWE-352)
  // Purpose: demonstrates missing CSRF protection for Fortify DAST/SAST
  // Fix: Add CSRF tokens and origin validation on state-changing requests

  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(locals);

  app.use('/uploads', express.static(env.uploadDir));
  app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/v3/api-docs', (_req, res) => res.json(swaggerSpec));

  app.use('/api/v3/site', siteRouter);
  app.use('/api/v3/users', usersRouter);
  app.use('/api/v3/products', productsRouter);
  app.use('/api/v3/orders', ordersRouter);
  app.use('/api/v3/messages', messagesRouter);
  app.use('/api/v3/reviews', reviewsRouter);
  app.use('/api/v3/roles', rolesRouter);

  app.use('/', defaultRouter);
  app.use('/products', productsWebRouter);
  app.use('/', cartRouter);
  app.use('/user', userPublicRouter);
  app.use('/user', userRouter);
  app.use('/admin', adminRouter);

  app.use('/api', apiErrorHandler);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
