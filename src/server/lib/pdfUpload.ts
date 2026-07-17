import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "/tmp/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Shared multer config for single-PDF-upload endpoints.
 * Field name is chosen per-route via .single(fieldName).
 */
export const pdfUpload = multer({
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
