import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import {
  createNewDocument,
  getAllDocuments,
  getDocument,
  updateDocument,
} from "./handlerFactory";
import { IField } from "../interfaces/IField";
import { Field } from "../models/fieldModel";
import mongoose from "mongoose";
import { Booking } from "../models/bookingModel";
import { cacheService } from "../services/redisService";

const getAllFields = getAllDocuments<IField>(Field, "fields");
const createNewField = createNewDocument<IField>(Field, "fields");

const getField = getDocument<IField>(Field, "fields");
const updateField = updateDocument<IField>(Field, "fields");
const deleteField = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const { id: fieldId } = req.params;

      const field = await Field.findByIdAndDelete(fieldId, { session });
      if (!field) {
        await session.abortTransaction();
        return next(new AppError("There is no field with that Id", 404));
      }

      await Booking.updateMany(
        { field: fieldId, status: "confirmed" },
        { $set: { status: "canceled" } },
        { session },
      );

      await session.commitTransaction();

      await Promise.all([
        cacheService.deleteByPattern("fields*"),
        cacheService.deleteByPattern("bookings*"),
      ]);

      res.status(204).json({
        status: "success",
        message: "Field was deleted successfully!",
      });
    } catch (err) {
      console.log("Delete Field Error: ", err);
      await session.abortTransaction();
      return next(err);
    } finally {
      await session.endSession();
    }
  },
);

const toggleFieldActivation = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const field = await Field.findById(id);

    if (!field) return next(new AppError("There no field with that Id", 404));

    field.isActive = !field.isActive;
    await field.save();

    res.status(200).json({
      status: "success",
      message: `Field is now ${field.isActive ? "active" : "inactive"}`,
      data: field,
    });
  },
);

export {
  getAllFields,
  getField,
  createNewField,
  updateField,
  deleteField,
  toggleFieldActivation,
};
