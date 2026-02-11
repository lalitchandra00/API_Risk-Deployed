import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { UserModel, UserDocument } from "../models/user.model";
import { ReportModel } from "../models/report.model";
import { ProjectModel } from "../models/project.model";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value: unknown): value is string =>
  typeof value === "string" && UUID_REGEX.test(value);

export type LoginRequest = {
  clientId: string;
};

export type LoginResponse = {
  accessToken: string;
  user: {
    userId: string;
    linkedClientIds: string[];
  };
};

/**
 * Validates that a clientId exists in the system.
 * A clientId is valid if it appears in at least one Project or Report.
 * This prevents unauthorized clientIds from creating user accounts.
 */
const validateClientIdExists = async (clientId: string): Promise<boolean> => {
  const [projectFound, reportFound] = await Promise.all([
    ProjectModel.findOne({ clientIds: clientId }).lean(),
    ReportModel.findOne({ clientId }).lean(),
  ]);

  return !!projectFound || !!reportFound;
};

/**
 * Authenticates a user by clientId.
 *
 * Rules:
 * - clientId must exist in at least one Project or Report
 * - If no User exists with this clientId, create one
 * - If User exists but lacks this clientId, append it
 * - Update lastLoginAt
 * - Issue a JWT access token
 *
 * Why clientId is identity, not security:
 * The clientId is a UUID issued by the CLI, uniquely tied to a deployment.
 * Multiple users could share a clientId (e.g., team members using same deployment).
 * The clientId identifies *which project scope* the user operates in, not *who* they are.
 * This is correct for a developer tool where teams push reports from shared CI/CD.
 */
export const authenticateByClientId = async (params: {
  clientId: string;
  jwtSecret: string;
  tokenExpirySeconds: number;
}): Promise<LoginResponse> => {
  const { clientId, jwtSecret, tokenExpirySeconds } = params;

  if (!isUuid(clientId)) {
    throw new Error("Invalid clientId format");
  }

  const exists = await validateClientIdExists(clientId);
  if (!exists) {
    throw new Error("clientId not found in system");
  }

  let user = await UserModel.findOne({ linkedClientIds: clientId });

  if (!user) {
    const userId = uuidv4();
    user = await UserModel.create({
      userId,
      linkedClientIds: [clientId],
      lastLoginAt: new Date(),
    });
  } else {
    if (!user.linkedClientIds.includes(clientId)) {
      user.linkedClientIds.push(clientId);
    }
    user.lastLoginAt = new Date();
    await user.save();
  }

  const payload = {
    userId: user.userId,
    linkedClientIds: user.linkedClientIds,
  };

  const accessToken = jwt.sign(payload, jwtSecret, {
    expiresIn: tokenExpirySeconds,
  });

  return {
    accessToken,
    user: {
      userId: user.userId,
      linkedClientIds: user.linkedClientIds,
    },
  };
};
