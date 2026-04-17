import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { Field } from "../models/fieldModel";
import { AppError } from "../utils/appError";

export const checkFieldIsActive = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const fieldId = req.body.field;
    const field = await Field.findById(fieldId);

    if (!field) {
      return next(new AppError("There is no field with that ID", 404));
    }

    if (!field.isActive)
      return next(new AppError("This Field is currently unavailable", 400));

    req.field = field;
    next();
  },
);
