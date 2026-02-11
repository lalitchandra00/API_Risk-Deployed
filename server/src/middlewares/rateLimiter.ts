import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

/**
 * In-memory rate limiting keyed by clientId.
 * Suitable for single-node v1 deployments.
 */
export const createRateLimiter = (options: {
  windowMs: number;
  maxRequests: number;
}) => {
  const { windowMs, maxRequests } = options;
  const store = new Map<string, RateLimitEntry>();

  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.body?.clientId as string | undefined;
    if (!clientId) {
      // Let validation handle missing clientId.
      next();
      return;
    }

    const now = Date.now();
    const entry = store.get(clientId);

    if (!entry || now > entry.resetAt) {
      store.set(clientId, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (entry.count >= maxRequests) {
      logger.warn("Rate limit exceeded", { clientId, path: req.path });
      res.status(429).json({ success: false, message: "Too Many Requests" });
      return;
    }

    entry.count += 1;
    next();
  };
};
