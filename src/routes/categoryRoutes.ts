import express from "express";
import {
  createNewCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  updateCategory,
} from "../controllers/categoryController";
import { normalizeCategoryName } from "../middlewares/NormalizeCategoryName";

const router = express.Router();

router
  .route("/")
  .get(getAllCategories)
  .post(normalizeCategoryName, createNewCategory);

router
  .route("/:id")
  .get(getCategory)
  .patch(updateCategory)
  .delete(deleteCategory);

export default router;
