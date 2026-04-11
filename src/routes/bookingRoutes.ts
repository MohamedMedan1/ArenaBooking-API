import express from "express";
import {createNewBooking } from "../controllers/bookingController";
import { protect } from "../controllers/authController";
import Client from "../models/clientModel";
import { insertFieldAndClientIds } from "../middlewares/insertFieldAndClientIds";
import { calculateBookingCostDetails } from "../middlewares/calculateBookingCostDetails";
import { checkFieldAvailability } from "../middlewares/checkFieldAvailability";

const router = express.Router({ mergeParams: true });

router.use(protect(Client));
router.post("/",insertFieldAndClientIds,calculateBookingCostDetails,checkFieldAvailability,createNewBooking);

export default router;