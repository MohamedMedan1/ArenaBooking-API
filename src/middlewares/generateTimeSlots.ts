import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import { generateSlots } from "../utils/generateSlots";

const generateTimeSlots = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.pricePerHour)
    return next(
      new AppError("Please provide price per hour for this field", 400),
    );

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  
  const { timeSlots, lastSlotAvailable } = generateSlots(
    7,
    req.body.pricePerHour,
    startDate,
    0.1,
  );

  req.body.timeSlots = timeSlots;
  req.body.lastSlotAvailable = lastSlotAvailable;
  next();
};

export { generateTimeSlots };
