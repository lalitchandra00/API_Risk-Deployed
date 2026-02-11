import mongoose, { Schema, Document, Model } from "mongoose";

export interface ProjectDocument extends Document {
  projectId: string;
  name: string;
  repoIdentifier: string;
  clientIds: string[];
  ownerUserId?: string;
  createdAt: Date;
  lastReportAt: Date;
}

const ProjectSchema = new Schema<ProjectDocument>(
  {
    projectId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    repoIdentifier: { type: String, required: true },
    clientIds: { type: [String], required: true, default: [] },
    ownerUserId: { type: String, required: false },
    createdAt: { type: Date, required: true, default: Date.now },
    lastReportAt: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false }
);

export const ProjectModel: Model<ProjectDocument> =
  mongoose.models.Project || mongoose.model<ProjectDocument>("Project", ProjectSchema);
