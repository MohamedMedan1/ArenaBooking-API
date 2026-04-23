import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import { AppError } from "../utils/appError";

const checkSlotAvailability = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const requiredDate = new Date(req.body.bookingDate);
    requiredDate.setUTCHours(0, 0, 0, 0);
    
    const targetDate = req.field?.timeSlots.find(cur => new Date(cur.date).toISOString() === requiredDate.toISOString());
    const targetTime = targetDate?.times.find(cur => cur.startTime === req.body.startTime && cur.endTime === req.body.endTime)

    if (!targetTime) return next(new AppError("This time slot does not exist for this field", 404));

    if (targetTime.isBooked) return next(new AppError("This Field in this time is already booked", 400));

    next();
  },
);

export { checkSlotAvailability };
