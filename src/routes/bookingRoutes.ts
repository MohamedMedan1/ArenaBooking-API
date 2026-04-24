import express from "express";
import {
  cancelBookingByAdmin,
  createNewBooking,
  getAllBookings,
  getBooking,
  markAsPaidByAdmin,
  paymobWebhook,
} from "../controllers/bookingController";
import { protect } from "../controllers/authController";
import Client from "../models/clientModel";
import { insertFieldAndClientIds } from "../middlewares/insertFieldAndClientIds";
import { checkSlotAvailability } from "../middlewares/checkSlotAvailability";
import { checkFieldIsActive } from "../middlewares/checkFieldIsActive";
import Admin from "../models/adminModel";
import { calculateDeposit } from "../middlewares/calculateDeposit";

const router = express.Router({ mergeParams: true });

router.post("/webhook", paymobWebhook);
router.post(
  "/",
  protect(Client),
  insertFieldAndClientIds,
  checkFieldIsActive,
  checkSlotAvailability,
  calculateDeposit,
  createNewBooking,
);

router.use(protect(Admin));
router.get("/", getAllBookings);
router.get("/:id", getBooking);

router.patch("/:bookingId/cancel", cancelBookingByAdmin);
router.patch("/:bookingId/paid", markAsPaidByAdmin);

export default router;
