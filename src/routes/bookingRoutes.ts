import express from "express";
import {createNewBooking, paymobWebhook } from "../controllers/bookingController";
import { protect } from "../controllers/authController";
import Client from "../models/clientModel";
import { insertFieldAndClientIds } from "../middlewares/insertFieldAndClientIds";
import { checkFieldAvailability } from "../middlewares/checkFieldAvailability";

const router = express.Router({ mergeParams: true });

router.post("/webhook", paymobWebhook);

router.use(protect(Client));
router.post("/", insertFieldAndClientIds,checkFieldAvailability, createNewBooking);

export default router;