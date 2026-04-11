import express from "express";
import { createNewField, deleteField, getAllFields } from "../controllers/fieldController";
import { uploadImage } from "../middlewares/uploadImage";
import { resizeImage } from "../middlewares/resizeImage";
import { uploadImageToCloud } from "../middlewares/uploadImageToCloud";
import { removeImage } from "../middlewares/removeImage";
import { Field } from "../models/fieldModel";
import { generateTimeSlots } from "../middlewares/generateTimeSlots";
import bookingRouter from "./bookingRoutes"

const router = express.Router();

// Nested Route
router.use("/:fieldId/bookings",bookingRouter);

router.route("/")
  .get(getAllFields)
  .post(uploadImage, resizeImage, uploadImageToCloud("fields"),generateTimeSlots, createNewField);
  
router.route("/:id")
  .delete(removeImage(Field),deleteField);

export default router;