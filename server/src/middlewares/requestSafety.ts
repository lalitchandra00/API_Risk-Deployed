import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Global request safety guards:
 * - Enforce JSON for API requests with a body
 * - Apply a timeout to avoid long-running requests
 */
export const requestSafety = (timeoutMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn("Request timed out", { path: req.path, method: req.method });
        res.status(503).json({ success: false, message: "Request timeout" });
        req.destroy();
      }
    }, timeoutMs);

    res.on("finish", () => clearTimeout(timer));
    res.on("close", () => clearTimeout(timer));

    const hasBody = ["POST", "PUT", "PATCH"].includes(req.method.toUpperCase());
    const isApiRoute = req.path.startsWith("/api/");

    if (isApiRoute && hasBody) {
      const contentType = req.headers["content-type"] || "";
      if (!contentType.includes("application/json")) {
        logger.warn("Rejected non-JSON payload", {
          path: req.path,
          method: req.method,
        });
        res.status(415).json({ success: false, message: "JSON required" });
        return;
      }
    }

    next();
  };
};
