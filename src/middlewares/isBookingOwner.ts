import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { Booking } from "../models/bookingModel";
import { AppError } from "../utils/appError";

export const isBookingOwner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const booking = await Booking.findOne({_id: id!, client: req.user!._id });

    if (!booking) {
      return next(new AppError("You aren't own this booking ", 404));
    }

    req.booking = booking;
    next();
  }
);