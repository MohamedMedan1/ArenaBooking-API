import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import { Field } from "../models/fieldModel";

const getAllFields = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const fields = await Field.find();
  
    res.status(200).json({
      status: "success",
      result: fields.length,
      data: fields,
    });
});

const createNewField = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newField = await Field.create(req.body);

    res.status(201).json({
      status: "success",
      data: newField,
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

export { getAllFields,createNewField,deleteField };
