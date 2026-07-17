import { Router } from "express";
import { pdfUpload } from "../lib/pdfUpload";
import * as decomposeController from "../controllers/decomposeController";

const router = Router();

// Quick decompose from PDF upload
router.post("/quick", pdfUpload.single("pdf"), decomposeController.quickDecompose);

// Decompose from text input
router.post("/text", decomposeController.textDecompose);

// Persist reviewed/selected tasks from a decomposition as a project + epic
router.post("/save", decomposeController.saveDecomposition);

// Team config CRUD
router.get("/team-configs", decomposeController.getTeamConfigs);
router.get("/team-configs/:id", decomposeController.getTeamConfig);
router.post("/team-configs", decomposeController.createTeamConfig);
router.patch("/team-configs/:id", decomposeController.updateTeamConfig);
router.delete("/team-configs/:id", decomposeController.deleteTeamConfig);

export default router;
