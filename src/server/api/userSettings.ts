import { Router } from "express";
import * as userSettingsController from "../controllers/userSettingsController";

const router = Router();

// All routes require userId parameter
router.get("/:userId", userSettingsController.getUserSettings);
router.put("/:userId", userSettingsController.updateUserSettings);
router.delete("/:userId/api-key", userSettingsController.deleteApiKey);
router.post("/validate-api-key", userSettingsController.validateApiKey);

export default router;
