import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import { Field } from "../models/fieldModel";
import { AppError } from "../utils/appError";

const calculateBookingCostDetails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fieldId } = req.params;
    const field = await Field.findById(fieldId).select("pricePerHour");

    if (!field) {
      return next(new AppError("There is no field with that ID!", 404));
    }

    const deposite = req.body.deposite || 0;
    const nightCost = req.body.nightCost || 0;

    req.body.totalPrice = field.pricePerHour * req.body.duration + nightCost;
    req.body.remaining = req.body.totalPrice - deposite;

    next();
  },
);

export { calculateBookingCostDetails };
