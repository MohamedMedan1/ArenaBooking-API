import express from "express";
import { protect, restrictTo } from "../controllers/authController";
import Admin from "../models/adminModel";
import { getDashboardInfo } from "../controllers/statsController";

const router = express.Router();

// Enable Authentication
router.use(protect(Admin));

router.get("/dashboard", getDashboardInfo);
router.get("/analytics", restrictTo("manager"));

export default router;