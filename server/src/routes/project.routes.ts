import { Router } from "express";
import { listProjectReportsHandler } from "../controllers/report.controller";
import {
	getProjectByIdHandler,
	listProjectsHandler,
} from "../controllers/project.controller";
import { authenticateRequest } from "../middlewares/authenticate.middleware";
import { authorizeProjectAccess } from "../middlewares/authorizeProject.middleware";

export const projectRouter = (params: { jwtSecret: string }) => {
	const { jwtSecret } = params;
	const router = Router();

	const authMiddleware = [authenticateRequest(jwtSecret)];
	const projectAuthMiddleware = [authenticateRequest(jwtSecret), authorizeProjectAccess];

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
