import express from "express";
import {
  createNewCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  updateCategory,
} from "../controllers/categoryController";
import { normalizeCategoryName } from "../middlewares/normalizeCategoryName";
import { uploadImage } from "../middlewares/uploadImage";
import { resizeImage } from "../middlewares/resizeImage";
import { uploadImageToCloud } from "../middlewares/uploadImageToCloud";
import { protect, restrictTo } from "../controllers/authController";
import Admin from "../models/adminModel";
import { removeImage } from "../middlewares/removeImage";

const router = express.Router();

// Enable Authentication and Azuthorization
router.use(protect(Admin));
router.use(restrictTo("manager"));

router
  .route("/")
  .get(getAllCategories)
  .post(uploadImage,resizeImage,uploadImageToCloud,normalizeCategoryName, createNewCategory);

router
  .route("/:id")
  .get(getCategory)
  .patch(uploadImage,removeImage,resizeImage,uploadImageToCloud,normalizeCategoryName,updateCategory)//User Upload New Image => Remove Old One from Cloud => Add New One Into Cloud => Update Image URL AND ID
  .delete(removeImage,deleteCategory);

export default router;
