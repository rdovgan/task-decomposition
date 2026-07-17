import { Router } from "express";
import { pdfUpload } from "../lib/pdfUpload";
import { apiKeyAuth } from "../middleware/apiKeyAuth";
import * as decomposeController from "../controllers/decomposeController";

const router = Router();

// Public API: upload a PDF, get decomposed tasks back as JSON. Requires X-API-Key header.
router.post("/decompose", apiKeyAuth, pdfUpload.single("file"), decomposeController.decomposePdfPublic);

export default router;
