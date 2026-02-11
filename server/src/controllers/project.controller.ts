import { Request, Response, NextFunction } from "express";
import { ProjectModel, ProjectDocument } from "../models/project.model";
import { listUserProjects } from "../services/project.service";

/**
 * Upserts a project record keyed by projectId.
 * - Adds the clientId to clientIds (if missing)
 * - Updates lastReportAt and metadata
 */
export const upsertProject = async (params: {
  projectId: string;
  clientId: string;
  name: string;
  repoIdentifier: string;
  lastReportAt: Date;
}): Promise<ProjectDocument> => {
  const { projectId, clientId, name, repoIdentifier, lastReportAt } = params;

  const updated = await ProjectModel.findOneAndUpdate(
    { projectId },
    {
      $set: { name, repoIdentifier, lastReportAt, projectId },
      $addToSet: { clientIds: clientId },
      $setOnInsert: { createdAt: new Date() },
    },
    { new: true, upsert: true }
  );

  return updated;
};

/**
 * GET /api/projects
 * Returns projects visible to the authenticated user.
 */
export const listProjectsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const projects = await listUserProjects({
      userId: req.user.userId,
      linkedClientIds: req.user.linkedClientIds || [],
    });

    res.status(200).json({ success: true, projects });
  } catch (err) {
    next(err as Error);
  }
};

/**
 * GET /api/projects/:projectId
 * Returns a single project if authorized by middleware.
 */
export const getProjectByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.project) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    res.status(200).json({
      success: true,
      project: {
        projectId: req.project.projectId,
        name: req.project.name,
        repoIdentifier: req.project.repoIdentifier,
        createdAt: req.project.createdAt,
        lastReportAt: req.project.lastReportAt,
      },
    });
  } catch (err) {
    next(err as Error);
  }
};
