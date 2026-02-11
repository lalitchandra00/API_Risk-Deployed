import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";

/**
 * Authenticates incoming requests using JWT in Authorization header.
 * Extracts the token from: Authorization: Bearer <token>
 *
 * Attaches req.user with:
 * - userId
 * - linkedClientIds
 */
export const authenticateRequest = (jwtSecret: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Missing auth token", { path: req.path });
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const token = authHeader.slice(7);

    try {
      const decoded = jwt.verify(token, jwtSecret) as {
        userId: string;
        linkedClientIds: string[];
      };

      req.user = {
        userId: decoded.userId,
        linkedClientIds: decoded.linkedClientIds || [],
      };

      next();
    } catch (err) {
      logger.warn("Invalid auth token", {
        error: (err as Error).message,
        path: req.path,
      });
      res.status(401).json({ success: false, message: "Unauthorized" });
    }
  };
};
