import { Router } from "express";
import projectRoutes from "./projects";
import epicRoutes from "./epics";
import taskRoutes from "./tasks";
import userRoutes from "./users";
import userSettingsRoutes from "./userSettings";
import decomposeRoutes from "./decompose";

const router = Router();

router.use("/projects", projectRoutes);
router.use("/epics", epicRoutes);
router.use("/tasks", taskRoutes);
router.use("/users", userRoutes);
router.use("/user-settings", userSettingsRoutes);
router.use("/decompose", decomposeRoutes);

export default router;
