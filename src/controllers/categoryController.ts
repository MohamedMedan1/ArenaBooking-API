import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import Category from "../models/categoryModel";
import { AppError } from "../utils/appError";
import { APIFeatures } from "../utils/apiFeatures";

const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const features = new APIFeatures(Category.find(), req.query)
      .filter()
      .sort()
      .fields()
      .paginate();

    const categories = await features.query;

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
      return next(new AppError("There is no category with that ID", 404));
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
      return next(new AppError("There is no category with that ID", 404));
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

export {
  getAllCategories,
  createNewCategory,
  getCategory,
  updateCategory,
  deleteCategory,
};
