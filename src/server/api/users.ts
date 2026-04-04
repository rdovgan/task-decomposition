import { Router } from "express";
import { getAllUsers, getUserById } from "../controllers/userController";

const router = Router();

// GET /api/users - Get all users
router.get("/", getAllUsers);

// GET /api/users/:id - Get a single user
router.get("/:id", getUserById);

export default router;
