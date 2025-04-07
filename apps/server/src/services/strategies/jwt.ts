import { env } from "@/config/env";
import { authRepository } from "@/modules/auth/authRepository";
import type { AccessTokenPayload } from "@/types/token";
import { logger } from "@/utils/logger";
import passport from "passport";
import { ExtractJwt, Strategy, type StrategyOptionsWithoutRequest } from "passport-jwt";

const opts: StrategyOptionsWithoutRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.ACCESS_TOKEN_SECRET,
  ignoreExpiration: false,
};

export default passport.use(
  new Strategy(opts, async (payload: AccessTokenPayload, done) => {
    try {
      const user = await authRepository.getUserByEmail(payload.email);
      if (!user) {
        return done(null, false);
      }
      done(null, user, { payload });
    } catch (err) {
      logger.error("Error verifying access token", err);
      done(err, false);
    }
  }),
);
