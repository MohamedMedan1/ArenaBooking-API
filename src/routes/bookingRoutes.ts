import express from "express";
import {
  createNewBooking,
  paymobWebhook,
} from "../controllers/bookingController";
import { protect } from "../controllers/authController";
import Client from "../models/clientModel";
import { insertFieldAndClientIds } from "../middlewares/insertFieldAndClientIds";
import { checkSlotAvailability } from "../middlewares/checkSlotAvailability";
import { checkFieldIsActive } from "../middlewares/checkFieldIsActive";

const router = express.Router({ mergeParams: true });

router.post("/webhook", paymobWebhook);

// Enable Authentication for all coming routes 
router.use(protect(Client));

router.post(
  "/",
  insertFieldAndClientIds,
  checkFieldIsActive,
  checkSlotAvailability,
  createNewBooking,
);

export default router;
