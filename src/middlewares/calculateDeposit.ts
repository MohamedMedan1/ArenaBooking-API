import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

export const calculateDeposit = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const field = req.field;

  if (!field || !field.pricePerHour) {
    return next(new AppError("Cannot find field into req body!", 404));
  }

  const { startTime, endTime } = req.body;
  if (!startTime || !endTime)
    return next(
      new AppError("Please provide startTime and endTime of Booking!", 400),
    );

  const startHour = parseInt(startTime.split(":")[0], 10);
  const endHour = parseInt(endTime.split(":")[0], 10);

  const totalDuration = endHour - startHour || 2;
  const DEPOSIT_PERCENTAGE = 0.3;
  req.body.deposit = field.pricePerHour * totalDuration * DEPOSIT_PERCENTAGE;
  next();
};
