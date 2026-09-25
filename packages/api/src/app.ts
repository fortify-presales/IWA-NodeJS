import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import express from 'express';
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
import { accountRouter } from './api/v3/account.js';
import { adminApiRouter } from './api/v3/admin.js';
import { agentRouter } from './api/v3/agent.js';
import { cryptoRouter } from './api/v3/crypto.js';
import { defaultRouter } from './web/default.js';
import { productsWebRouter } from './web/products.js';
import { cartRouter } from './web/cart.js';
import { userRouter } from './web/user.js';
import { adminRouter } from './web/admin/index.js';

const logoutConditionMarker = 'WEBINSPECT_LOGOUT_CONDITION IWA_LOGIN_REQUIRED';

function requireAuthenticatedSpaSession(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.isAuthenticated?.() || !req.user) {
    res.setHeader('X-IWA-Auth-State', 'logged-out');
    return res.status(401).send(`Authentication required\n${logoutConditionMarker}`);
  }
  res.setHeader('X-IWA-Auth-State', 'logged-in');
  next();
}

function sendSpaShell(req: express.Request, res: express.Response) {
  const indexPath = path.resolve('public/app/index.html');
  const html = fs.readFileSync(indexPath, 'utf8');
  const loggedIn = Boolean(req.isAuthenticated?.() && req.user);

  res.setHeader('X-IWA-Auth-State', loggedIn ? 'logged-in' : 'logged-out');

  if (req.path === '/app/login' && !loggedIn) {
    const marker = `<div id="webinspect-logout-condition" hidden>${logoutConditionMarker} Login</div>`;
    return res.type('html').send(html.replace('<div id="root"></div>', `${marker}\n    <div id="root"></div>`));
  }

  return res.type('html').send(html);
}

export function createApp() {
  const app = express();

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

  app.use(express.static(path.resolve('public')));
  app.use('/uploads', express.static(env.uploadDir));
  app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { url: '/v3/api-docs' },
  }));
  // Redirect the static index.html (which defaults to Petstore) to the configured UI
  app.get('/swagger-ui/index.html', (_req, res) => res.redirect(301, '/swagger-ui/'));
  app.get('/v3/api-docs', (_req, res) => res.json(swaggerSpec));

  app.use('/api/v3/site', siteRouter);
  app.use('/api/v3/users', usersRouter);
  app.use('/api/v3/products', productsRouter);
  app.use('/api/v3/orders', ordersRouter);
  app.use('/api/v3/messages', messagesRouter);
  app.use('/api/v3/reviews', reviewsRouter);
  app.use('/api/v3/roles', rolesRouter);
  app.use('/api/v3/account', accountRouter);
  app.use('/api/v3/admin', adminApiRouter);
  app.use('/api/v3/agent', agentRouter);
  app.use('/api/v3/crypto', cryptoRouter);

  app.use('/', defaultRouter);
  app.use('/products', productsWebRouter);
  app.use('/', cartRouter);
  app.use('/user', userRouter);
  app.use('/admin', adminRouter);

  app.use(['/app/user', '/app/user/*', '/app/admin', '/app/admin/*'], requireAuthenticatedSpaSession);

  app.get(['/app', '/app/*'], sendSpaShell);

  app.use('/api', apiErrorHandler);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
