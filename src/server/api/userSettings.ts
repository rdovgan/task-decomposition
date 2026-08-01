import { Router } from "express";
import * as userSettingsController from "../controllers/userSettingsController";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);

router.get("/", userSettingsController.getUserSettings);
router.put("/", userSettingsController.updateUserSettings);
router.delete("/api-key", userSettingsController.deleteApiKey);
router.post("/validate-api-key", userSettingsController.validateApiKey);

export default router;
