import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as decomposeController from "../controllers/decomposeController";

const router = Router();

// Ensure uploads directory exists
const uploadDir = "/tmp/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for PDF uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// Quick decompose from PDF upload
router.post("/quick", upload.single("pdf"), decomposeController.quickDecompose);

// Decompose from text input
router.post("/text", decomposeController.textDecompose);

// Team config CRUD
router.get("/team-configs", decomposeController.getTeamConfigs);
router.get("/team-configs/:id", decomposeController.getTeamConfig);
router.post("/team-configs", decomposeController.createTeamConfig);
router.patch("/team-configs/:id", decomposeController.updateTeamConfig);
router.delete("/team-configs/:id", decomposeController.deleteTeamConfig);

export default router;
