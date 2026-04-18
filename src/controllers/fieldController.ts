import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import { Field } from "../models/fieldModel";
import { APIFeatures } from "../utils/apiFeatures";
import { AppError } from "../utils/appError";

const getAllFields = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const features = new APIFeatures(Field.find(), req.query)
      .filter()
      .sort()
      .fields()
      .paginate();

    const fields = await features.query;

    res.status(200).json({
      status: "success",
      result: fields.length,
      data: fields,
    });
  },
);


const getField = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const feature = new APIFeatures(Field.findById(id), req.query).fields();

    const field = await feature.query;

    res.status(200).json({
      status: "success",
      data: field,
    });
  },
);

const createNewField = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newField = await Field.create(req.body);

    res.status(201).json({
      status: "success",
      data: newField,
    });
  },
);

const updateField = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const field = await Field.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!field) {
      return next(new AppError("There is no field with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: field,
    });
  },
);

const deleteField = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req?.params;

    await Field.findByIdAndDelete(id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);

export {
  getAllFields,
  getField,
  createNewField,
  updateField,
  deleteField,
};
