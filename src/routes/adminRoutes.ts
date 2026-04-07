import express from "express";
import { login, register } from "../controllers/authController";
import Admin from "../models/adminModel";

const router = express.Router();

// =====  Authentication Routes =====
router.post("/login",login(Admin));
router.post("/register",register(Admin));

export default router;