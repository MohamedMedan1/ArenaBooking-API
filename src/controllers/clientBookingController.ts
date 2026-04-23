import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import mongoose from "mongoose";
import { AppError } from "../utils/appError";
import { Booking } from "../models/bookingModel";
import { APIFeatures } from "../utils/apiFeatures";
import { processFieldSlot } from "../services/fieldService";
import { cacheService } from "../services/redisService";
import { IBooking } from "../interfaces/IBooking";

const getMyBookings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const baseKey = `myBookings-${req.user!._id}`;
    const cacheKey =
      Object.keys(req.query).length > 0
        ? `${baseKey}:${JSON.stringify(req.query)}`
        : baseKey;

    const data: IBooking[] | null =
      await cacheService.get<IBooking[]>(cacheKey);
    let myBookings: IBooking[];

    if (!data) {
      const features = new APIFeatures(
        Booking.find({ client: req.user!._id }).lean(),
        req.query,
      )
        .filter()
        .sort()
        .fields()
        .paginate();
      myBookings = await features.query;
      await cacheService.set(cacheKey, myBookings, 3600);
    } else {
      myBookings = data;
    }

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
    const cacheKey = `myBookings-${id}`;
    const data = await cacheService.get<IBooking>(cacheKey);
    let myBooking: IBooking | null;

    if (!data) {
      myBooking = await Booking.findOne({
        _id: id!,
        client: req.user!._id,
      }).lean();
      if (!myBooking)
        return next(
          new AppError("There is no booking for you with that Id", 404),
        );

      await cacheService.set(cacheKey, myBooking, 3600);
    } else {
      myBooking = data;
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
        String(req.booking!.field!._id),
        String(req.booking!.bookingDate),
        req.booking!.startTime,
        req.booking!.endTime,
        session,
      );

      req.booking!.status = "canceled";
      await req.booking!.save({ session });

      await session.commitTransaction();

      await cacheService.delete(`bookings`);
      await cacheService.delete(`myBookings-${req.user!._id}`);
      await cacheService.delete(`myBookings-${req.booking!._id}`);

      res.status(200).json({
        status: "success",
        message: "Booking cancelled successfully",
      });
    } catch (error) {
      await session.abortTransaction();
      return next(error);
    } finally {
      session.endSession();
    }
  },
);

export { getMyBookings, getMyBooking, cancelMyBooking };
