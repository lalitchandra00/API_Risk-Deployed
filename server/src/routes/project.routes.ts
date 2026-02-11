import { Router } from "express";
import { listProjectReportsHandler } from "../controllers/report.controller";
import {
	getProjectByIdHandler,
	listProjectsHandler,
} from "../controllers/project.controller";
import { authenticateRequest } from "../middlewares/authenticate.middleware";
import { authorizeProjectAccess } from "../middlewares/authorizeProject.middleware";
import { FeatureFlags } from "../config/featureFlags";

export const projectRouter = (params: {
	featureFlags: FeatureFlags;
	jwtSecret: string;
}) => {
	const { featureFlags, jwtSecret } = params;
	const router = Router();

	const authMiddleware = featureFlags.enableAuth
		? [authenticateRequest(jwtSecret)]
		: [];
	const projectAuthMiddleware = featureFlags.enableAuth
		? [authenticateRequest(jwtSecret), authorizeProjectAccess]
		: [];

	router.get("/api/projects", ...authMiddleware, listProjectsHandler);
	router.get(
		"/api/projects/:projectId",
		...projectAuthMiddleware,
		getProjectByIdHandler
	);
	router.get(
		"/api/projects/:projectId/reports",
		...projectAuthMiddleware,
		listProjectReportsHandler
	);

	return router;
};
