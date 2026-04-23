import express from "express";
import { changePassword, login, protect, register, restrictTo } from "../controllers/authController";
import Admin from "../models/adminModel";
import { createNewAssistant, deleteAssistant, getAllAssistants, getMe } from "../controllers/adminController";
import { updateMe } from "../controllers/adminController";

const router = express.Router();

// =====  Authentication Routes =====
router.post("/login",login(Admin));

// Enable Authentication
router.use(protect(Admin));

router.patch("/change-password", changePassword(Admin));
router.route("/me")
  .get(getMe)
  .patch(updateMe);
  
router.use(restrictTo("manager"));
router.route("/")
  .get(getAllAssistants)
  .post(createNewAssistant);

router.delete("/:id",deleteAssistant);

export default router;