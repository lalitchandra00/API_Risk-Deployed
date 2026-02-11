import { EnvConfig } from "./env";
import { logger } from "../utils/logger";

export type FeatureFlags = {
  enableAuth: boolean;
  enableRateLimiting: boolean;
  enablePublicReports: boolean;
};

/**
 * Centralized feature flags for safe, predictable toggling.
 * Disabled features are logged once at startup.
 */
export const buildFeatureFlags = (env: EnvConfig): FeatureFlags => {
  const flags = {
    enableAuth: env.enableAuth,
    enableRateLimiting: env.enableRateLimiting,
    enablePublicReports: env.enablePublicReports,
  };

  if (!flags.enableAuth) {
    logger.warn("Feature disabled: ENABLE_AUTH=false (auth checks skipped)");
  }

  if (!flags.enableRateLimiting) {
    logger.warn("Feature disabled: ENABLE_RATE_LIMITING=false");
  }

  if (!flags.enablePublicReports) {
    logger.warn("Feature disabled: ENABLE_PUBLIC_REPORTS=false");
  }

  return flags;
};
