import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import Category from "../models/categoryModel";

const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await Category.find();

    res.status(200).json({
      status: "success",
      result: categories.length,
      data: categories,
    });
  },
);

const createNewCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newCategory = await Category.create(req.body);

    res.status(201).json({
      status: "success",
      data: newCategory,
    });
  },
);

const getCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return next();
      // Will handle this error later
    }

    res.status(200).json({
      status: "success",
      data: category,
    });
  },
);

const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return next();
      // Will handle this error later
    }

    res.status(200).json({
      status: "success",
      data: category,
    });
  },
);

const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);

export { getAllCategories, createNewCategory, getCategory,updateCategory,deleteCategory };
