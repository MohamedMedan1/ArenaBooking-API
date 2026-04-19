import express from "express";
import { cancelMyBooking, getMyBooking } from "../controllers/clientBookingController";
import { isBookingOwner } from "../middlewares/isBookingOwner";
import { isBefore24h } from "../middlewares/isBefore24h";

const router = express.Router();

router.get('/:id', getMyBooking);
router.patch('/:id/cancel', isBookingOwner,isBefore24h,cancelMyBooking);

router.get('/', getMyBooking); 

export default router;