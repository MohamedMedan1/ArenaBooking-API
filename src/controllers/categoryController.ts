import Category from "../models/categoryModel";
import {
  createNewDocument,
  deleteDocument,
  getAllDocuments,
  getDocument,
  updateDocument,
} from "./handlerFactory";
import { ICategory } from "../interfaces/ICategory";

const getAllCategories = getAllDocuments<ICategory>(Category,"categories");
const createNewCategory = createNewDocument<ICategory>(Category,"categories");

const getCategory = getDocument<ICategory>(Category,"categories");
const updateCategory = updateDocument<ICategory>(Category,"categories");
const deleteCategory = deleteDocument<ICategory>(Category,"categories");

export {
  getAllCategories,
  createNewCategory,
  getCategory,
  updateCategory,
  deleteCategory,
};
