import Category from "../models/categoryModel";
import {
  createNewDocument,
  deleteDocument,
  getAllDocuments,
  getDocument,
  updateDocument,
} from "./handlerFactory";
import { ICategory } from "../interfaces/ICategory";

const getAllCategories = getAllDocuments<ICategory>(Category);
const createNewCategory = createNewDocument<ICategory>(Category);

const getCategory = getDocument<ICategory>(Category);
const updateCategory = updateDocument<ICategory>(Category);
const deleteCategory = deleteDocument<ICategory>(Category);

export {
  getAllCategories,
  createNewCategory,
  getCategory,
  updateCategory,
  deleteCategory,
};
