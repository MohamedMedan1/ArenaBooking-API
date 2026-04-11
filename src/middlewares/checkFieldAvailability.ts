import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import { Field } from "../models/fieldModel";
import { AppError } from "../utils/appError";

const checkFieldAvailability = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fieldId } = req.params;
    const field = await Field.findOne({
      _id: fieldId as string,
      timeSlots: {
        $elemMatch: {
          date: new Date(req.body.bookingDate),
          times: {
            $elemMatch: {
              startTime: req.body.startTime,
              endTime: req.body.endTime,
              isBooked: false,
            },
          },
        },
      },
    });
    if (!field)
      return next(
        new AppError("This Field in this time is already booked", 400),
      );

    next();
  },
);

export { checkFieldAvailability };