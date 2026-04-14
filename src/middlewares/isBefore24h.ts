import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { AppError } from "../utils/appError";

export const isBefore24h = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000;
    const availableToCancel = new Date(req.booking!.bookingDate).getTime() - new Date().getTime() > CANCELLATION_WINDOW_MS ;

    if (!availableToCancel) {
      return next(new AppError("Cancellation failed. Bookings can only be cancelled at least 24 hours before the match time.", 403));
    }

    next();
  },
);
