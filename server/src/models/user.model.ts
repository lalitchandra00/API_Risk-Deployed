import mongoose, { Schema, Document, Model } from "mongoose";

export interface UserDocument extends Document {
  userId: string;
  linkedClientIds: string[];
  createdAt: Date;
  lastLoginAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    userId: { type: String, required: true, unique: true },
    linkedClientIds: { type: [String], required: true, default: [] },
    createdAt: { type: Date, required: true, default: Date.now },
    lastLoginAt: { type: Date, required: true, default: Date.now },
  },
  { versionKey: false }
);

export const UserModel: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);
