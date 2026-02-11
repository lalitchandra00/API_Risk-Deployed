/**
 * This file is deprecated. Use authenticate.middleware.ts instead.
 * Kept for backward compatibility only.
 */

export const requireAuth = () => {
  throw new Error("requireAuth is deprecated. Use authenticateRequest from authenticate.middleware instead.");
};

