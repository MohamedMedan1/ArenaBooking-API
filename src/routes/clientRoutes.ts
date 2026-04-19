import express from "express";
import { changePassword, login, protect, register } from "../controllers/authController";
import Client from "../models/clientModel";
import { getMe, updateMe } from "../controllers/clientController";
import clientBookingRouter from "./clientBookingRoutes";

const router = express.Router();

// =====  Authentication Routes =====
router.post("/login", login(Client));
router.post("/register", register(Client));


router.patch("/change-password",protect(Client), changePassword(Client));

router.use("/me", protect(Client)); 
router.route("/me")
  .get(getMe)
  .patch(updateMe);

router.use("/me/bookings", protect(Client),clientBookingRouter);
  
export default router;