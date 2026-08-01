import { Router } from "express";
import * as authController from "../controllers/authController";
import { validate } from "../middleware/validation";
import { signupSchema, loginSchema } from "../lib/validations";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);

export default router;
