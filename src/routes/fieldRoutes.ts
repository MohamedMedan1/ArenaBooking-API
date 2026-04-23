import express from "express";
import {
  createNewField,
  deleteField,
  getAllFields,
  getField,
  updateField,
} from "../controllers/fieldController";
import { uploadImage } from "../middlewares/uploadImage";
import { resizeImage } from "../middlewares/resizeImage";
import { uploadImageToCloud } from "../middlewares/uploadImageToCloud";
import { removeImage } from "../middlewares/removeImage";
import { Field } from "../models/fieldModel";
import { generateTimeSlots } from "../middlewares/generateTimeSlots";
import bookingRouter from "./bookingRoutes";
import { protect, restrictTo } from "../controllers/authController";
import Admin from "../models/adminModel";
import Client from "../models/clientModel";

const router = express.Router();

// Main Routes
router.get("/", getAllFields);
router.get("/:id", getField);

// ======== Nested Route  ========
router.use("/:fieldId/bookings", bookingRouter);

// Enable Authentication for all coming routes
router.use(protect(Admin));
// Enable more specific Authorization for all coming routes
router.use(restrictTo("manager"));

router
  .route("/")
  .post(
    uploadImage,
    resizeImage,
    uploadImageToCloud("fields"),
    generateTimeSlots,
    createNewField,
  );

router
  .route("/:id")
  .patch(
    uploadImage,
    resizeImage,
    uploadImageToCloud("fields"),
    generateTimeSlots,
    updateField,
  )
  .delete(removeImage(Field), deleteField);

export default router;
