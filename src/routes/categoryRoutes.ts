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
import Category from "../models/categoryModel";

const router = express.Router();

// All Users can access this routes 
router.get("/", getAllCategories);
router.get("/:id",getCategory)

// Enable Authentication for all coming routes 
router.use(protect(Admin));

// Enable Authorization for all coming routes 
router.use(restrictTo("manager", "assistant"));

router.patch("/:id",uploadImage,removeImage(Category),resizeImage,uploadImageToCloud("categories"),normalizeCategoryName,updateCategory)

// Enable more specific Authorization for all coming routes
router.use(restrictTo("manager"));

router.route("/")
  .post(uploadImage, resizeImage, uploadImageToCloud("categories"), normalizeCategoryName, createNewCategory);

router.delete("/:id",removeImage(Category),deleteCategory);

export default router;
