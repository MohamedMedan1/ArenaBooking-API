import express from "express";
import {
  createNewField,
  deleteField,
  getAllFields,
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


router.get("/", getAllFields);

// ======== Nested Route  ========
router.use("/:fieldId/bookings",protect(Client), bookingRouter);

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

router.route("/:id").delete(removeImage(Field), deleteField);

export default router;
