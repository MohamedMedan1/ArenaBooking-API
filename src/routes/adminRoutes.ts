import express from "express";
import { changePassword, login, protect, register } from "../controllers/authController";
import Admin from "../models/adminModel";
import { getMe } from "../controllers/adminController";
import { updateMe } from "../controllers/adminController";

const router = express.Router();

// =====  Authentication Routes =====
router.post("/login",login(Admin));
router.post("/register", register(Admin));

// Enable Authentication
router.use(protect(Admin));

router.patch("/change-password", changePassword(Admin));

router.route("/me")
  .get(getMe)
  .patch(updateMe);

export default router;