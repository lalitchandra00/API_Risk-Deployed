import "express";
import { ProjectDocument } from "../models/project.model";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      userId: string;
      linkedClientIds: string[];
    };
    project?: ProjectDocument;
  }
}
