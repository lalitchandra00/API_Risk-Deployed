import { Router } from "express";
import {
	createReportHandler,
	getReportByIdHandler,
} from "../controllers/report.controller";
import { createRateLimiter } from "../middlewares/rateLimiter";
import { EnvConfig } from "../config/env";
import { FeatureFlags } from "../config/featureFlags";

export const reportRouter = (params: { env: EnvConfig; featureFlags: FeatureFlags }) => {
	const { env, featureFlags } = params;
	const router = Router();

	if (featureFlags.enableRateLimiting) {
		const rateLimiter = createRateLimiter({
			windowMs: env.rateLimitWindowMs,
			maxRequests: env.rateLimitMax,
		});
		router.post("/api/reports", rateLimiter, createReportHandler);
	} else {
		router.post("/api/reports", createReportHandler);
	}

	router.get("/api/reports/:reportId", getReportByIdHandler);

	return router;
};
