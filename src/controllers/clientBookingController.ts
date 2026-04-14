import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import mongoose from "mongoose";
import { AppError } from "../utils/appError";
import { Booking } from "../models/bookingModel";
import { APIFeatures } from "../utils/apiFeatures";
import { Field } from "../models/fieldModel";

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
      const bookingDate = new Date(req.booking!.bookingDate);

      const filter = {
        _id: req.booking!.field,
        timeSlots: {
          $elemMatch: {
            date: bookingDate,
            times: {
              $elemMatch: {
                startTime: req.booking!.startTime,
                endTime: req.booking!.endTime,
                isBooked: true,
              },
            },
          },
        },
      };

      const field = await Field.findOne(filter).session(session);

      if (!field) return null;

      const daySlot = field.timeSlots.find(
        (slot) => slot.date.toISOString() === bookingDate.toISOString(),
      );

      const timeSlot = daySlot?.times.find(
        (t) =>
          t.startTime === req.booking!.startTime &&
          t.endTime === req.booking!.endTime,
      );

      if (timeSlot) timeSlot.isBooked = false;
      field.markModified("timeSlots");
      await field.save({ session });

      req.booking!.status = 'cancelled';
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
