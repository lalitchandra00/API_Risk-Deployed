import { ProjectModel } from "../models/project.model";

export type ProjectSummary = {
  projectId: string;
  name: string;
  repoIdentifier: string;
  createdAt: Date;
  lastReportAt: Date;
};

/**
 * Returns projects owned by a user or linked via clientIds.
 * Excludes sensitive identifiers from the payload.
 */
export const listUserProjects = async (params: {
  userId: string;
  linkedClientIds: string[];
}): Promise<ProjectSummary[]> => {
  const { userId, linkedClientIds } = params;

  const projects = await ProjectModel.find({
    $or: [
      { ownerUserId: userId },
      { clientIds: { $in: linkedClientIds } },
    ],
  })
    .select("projectId name repoIdentifier createdAt lastReportAt -_id")
    .lean();

  return projects as ProjectSummary[];
};
