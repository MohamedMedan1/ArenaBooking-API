import Category from "../models/categoryModel";
import { Field } from "../models/fieldModel";
import {
  createNewDocument,
  getAllDocuments,
  getDocument,
  updateDocument,
} from "./handlerFactory";
import { ICategory } from "../interfaces/ICategory";
import catchAsync from "../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/appError";
import { Booking } from "../models/bookingModel";
import { cacheService } from "../services/redisService";

const getAllCategories = getAllDocuments<ICategory>(Category, "categories");
const createNewCategory = createNewDocument<ICategory>(Category, "categories");

const getCategory = getDocument<ICategory>(Category, "categories");
const updateCategory = updateDocument<ICategory>(Category, "categories");
const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const { id: categoryId } = req.params;
      const category = await Category.findByIdAndDelete(categoryId, {
        session,
      });
      if (!category)
        return next(new AppError("There is no category with that Id", 404));

      // Remove all fields that were related to deleted category
      const fieldsIds = await Field.find({ category: categoryId }).select(
        "_id",
      );

      if (fieldsIds.length === 0) {
        await session.commitTransaction();

        return res.status(204).json({
          status: "success",
          message: "Category was deleted successfully!",
        });
      }

      // Remove all fields that were related to deleted category
      await Field.deleteMany({ category: categoryId }, { session });

      // Update all bookings that were realted to deleted fields
      await Booking.updateMany(
        { field: { $in: fieldsIds.map((f) => f._id) }, status: "confirmed" },
        { $set: { status: "canceled" } },
        { session },
      );
      await session.commitTransaction();

      await Promise.all([
        cacheService.deleteByPattern("categories*"),
        cacheService.deleteByPattern("fields*"),
        cacheService.deleteByPattern("bookings*"),
      ]);

      res.status(204).json({
        status: "success",
        message: "Category was deleted successfully!",
      });
    } catch (err) {
      console.log("Delete Category Error: ", err);
      await session.abortTransaction();
      return next(err);
    } finally {
      await session.endSession();
    }
  },
);

export {
  getAllCategories,
  createNewCategory,
  getCategory,
  updateCategory,
  deleteCategory,
};
