import express from "express";
import { protect, restrictTo } from "../controllers/authController";
import Admin from "../models/adminModel";
import { getAnalyticsInfo, getDashboardInfo } from "../controllers/statsController";

const router = express.Router();

// Enable Authentication
router.use(protect(Admin));

router.get("/dashboard", getDashboardInfo);
router.get("/analytics", restrictTo("manager"),getAnalyticsInfo);

export default router;