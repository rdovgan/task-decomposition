import { Router } from "express";
import authRoutes from "./auth";
import projectRoutes from "./projects";
import epicRoutes from "./epics";
import taskRoutes from "./tasks";
import userRoutes from "./users";
import userSettingsRoutes from "./userSettings";
import decomposeRoutes from "./decompose";
import jiraRoutes from "./jira";
import v1Routes from "./v1";

const router = Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/epics", epicRoutes);
router.use("/tasks", taskRoutes);
router.use("/users", userRoutes);
router.use("/user-settings", userSettingsRoutes);
router.use("/decompose", decomposeRoutes);
router.use("/jira", jiraRoutes);
router.use("/v1", v1Routes);

export default router;
