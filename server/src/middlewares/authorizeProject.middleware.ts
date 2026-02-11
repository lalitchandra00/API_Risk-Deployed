import { Request, Response, NextFunction } from "express";
import { ProjectModel } from "../models/project.model";
import { logger } from "../utils/logger";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value: unknown): value is string =>
  typeof value === "string" && UUID_REGEX.test(value);

const intersects = (a: string[], b: string[]) => {
  const setB = new Set(b);
  return a.some((value) => setB.has(value));
};

/**
 * Authorizes access to a project using ownership rules:
 * - ownerUserId matches userId OR
 * - project.clientIds intersects with user.linkedClientIds
 *
 * If the project is unclaimed (no ownerUserId) but linked via clientIds,
 * the project is implicitly claimed by setting ownerUserId = userId.
 */
export const authorizeProjectAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.user.userId) {
    logger.warn("Unauthorized access", { path: req.path, method: req.method });
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const projectId = req.params.projectId;
  if (!isUuid(projectId)) {
    res.status(400).json({ success: false, message: "Invalid projectId" });
    return;
  }

  const project = await ProjectModel.findOne({ projectId });
  if (!project) {
    logger.warn("Project not found", { projectId });
    res.status(404).json({ success: false, message: "Project not found" });
    return;
  }

  const { userId, linkedClientIds } = req.user;
  const hasClientIntersection = intersects(
    project.clientIds || [],
    linkedClientIds || []
  );

  const isOwner = project.ownerUserId === userId || hasClientIntersection;
  if (!isOwner) {
    logger.warn("Forbidden project access", { projectId, userId });
    res.status(403).json({ success: false, message: "Forbidden" });
    return;
  }

  if (!project.ownerUserId && hasClientIntersection) {
    project.ownerUserId = userId;
    await project.save();
  }

  req.project = project;
  next();
};
