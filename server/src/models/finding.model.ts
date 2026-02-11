import mongoose, { Schema, Document, Model } from "mongoose";

export interface FindingDocument extends Document {
  findingId: string;
  reportId: string;
  ruleId: string;
  severity: string;
  confidence: string;
  filePath: string;
  lineNumber: number;
  codeSnippet: string;
  explanation: string;
  createdAt: Date;
}

const FindingSchema = new Schema<FindingDocument>(
  {
    findingId: { type: String, required: true },
    reportId: { type: String, required: true, index: true },
    ruleId: { type: String, required: true },
    severity: { type: String, required: true },
    confidence: { type: String, required: true },
    filePath: { type: String, required: true },
    lineNumber: { type: Number, required: true },
    codeSnippet: { type: String, required: true },
    explanation: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false }
);

export const FindingModel: Model<FindingDocument> =
  mongoose.models.Finding || mongoose.model<FindingDocument>("Finding", FindingSchema);
