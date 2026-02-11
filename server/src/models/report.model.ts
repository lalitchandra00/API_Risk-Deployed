
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ReportSummary {
  filesScanned: number;
  findings: number;
  blocks: number;
  warnings: number;
  finalVerdict: string;
}

export interface ReportDocument extends Document {
  reportId: string;
  projectId: string;
  clientId: string;
  timestamp: Date;
  scanMode: string;
  summary: ReportSummary;
  createdAt: Date;
}

const ReportSummarySchema = new Schema<ReportSummary>(
  {
    filesScanned: { type: Number, required: true },
    findings: { type: Number, required: true },
    blocks: { type: Number, required: true },
    warnings: { type: Number, required: true },
    finalVerdict: { type: String, required: true },
  },
  { _id: false }
);

const ReportSchema = new Schema<ReportDocument>(
  {
    reportId: { type: String, required: true, unique: true },
    projectId: { type: String, required: true, index: true },
    clientId: { type: String, required: true },
    timestamp: { type: Date, required: true },
    scanMode: { type: String, required: true },
    summary: { type: ReportSummarySchema, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false }
);

export const ReportModel: Model<ReportDocument> =
  mongoose.models.Report || mongoose.model<ReportDocument>("Report", ReportSchema);
