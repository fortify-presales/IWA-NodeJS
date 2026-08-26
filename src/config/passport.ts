import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Authority } from '../models/Authority.js';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export function configurePassport() {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // INSECURE: logs password to debug log (CWE-532)
        // Purpose: demonstrates sensitive data in logs for Fortify SAST
        // Fix: Never log passwords or secrets
        logger.debug(`Login attempt for user: ${username}, password: ${password}`);

        const user = await User.findOne({
          where: { username },
          include: [{ model: Authority }],
        });

        if (!user) return done(null, false, { message: 'Invalid username or password' });
        if (!user.enabled) return done(null, false, { message: 'Account is disabled' });
        if (user.locked) return done(null, false, { message: 'Account is locked' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          user.failedLoginAttempts += 1;
          if (user.failedLoginAttempts >= 5) user.locked = true;
          await user.save();
          return done(null, false, { message: 'Invalid username or password' });
        }

        user.failedLoginAttempts = 0;
        user.lastLogin = new Date();
        await user.save();

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: env.jwtSecret,
        algorithms: ['HS512'],
      },
      async (payload, done) => {
        try {
          const user = await User.findByPk(payload.sub, {
            include: [{ model: Authority }],
          });
          if (!user) return done(null, false);
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findByPk(id, { include: [{ model: Authority }] });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  return passport;
}
