import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import mongoose from "mongoose";
import { AppError } from "../utils/appError";
import { Booking } from "../models/bookingModel";
import { APIFeatures } from "../utils/apiFeatures";
import { Field } from "../models/fieldModel";
import { processFieldSlot } from "../services/fieldService";

const getMyBookings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const features = new APIFeatures(
      Booking.find({ client: req.user!._id }),
      req.query,
    )
      .filter()
      .sort()
      .fields()
      .paginate();

    const myBookings = await features.query;

    res.status(200).json({
      status: "success",
      result: myBookings.length,
      data: myBookings,
    });
  },
);

const getMyBooking = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const myBooking = await Booking.findOne({
      _id: id!,
      client: req.user!._id,
    });

    if (!myBooking) {
      return next(
        new AppError("There is no booking for you with that Id", 404),
      );
    }

    res.status(200).json({
      status: "success",
      data: myBooking,
    });
  },
);

const cancelMyBooking = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      await processFieldSlot(
        "unLockField",
        String(req.booking!.field),
        String(req.booking!.bookingDate),
        req.booking!.startTime,
        req.booking!.endTime,
        session,
      );

      req.booking!.status = "cancelled";
      await req.booking!.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      return next(error);
    } finally {
      session.endSession();
    }
  },
);

export { getMyBookings, getMyBooking, cancelMyBooking };
