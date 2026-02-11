import mongoose from "mongoose";
import { logger } from "../utils/logger";

/**
 * Establishes a resilient MongoDB connection using Mongoose.
 * Uses environment-based configuration to keep deployment simple.
 */
export const connectToDatabase = async (mongoUri: string): Promise<void> => {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  mongoose.connection.on("error", (err) => {
    // Log and keep the process alive; the caller decides retries.
    // This prevents a hard crash on intermittent DB issues.
    logger.error("MongoDB connection error", { error: String(err) });
  });

  mongoose.connection.once("open", () => {
    logger.info("MongoDB connected");
  });

  await mongoose.connect(mongoUri);
};
