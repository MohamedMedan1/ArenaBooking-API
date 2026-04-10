import { Model as MongooseModel } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { cloudinary } from "../config/cloudinary";
import catchAsync from "../utils/catchAsync";
import Category from "../models/categoryModel";
import { AppError } from "../utils/appError";
import { ICategory } from "../interfaces/ICategory";
import { IField } from "../interfaces/IField";

const removeImage = (Model: MongooseModel<ICategory | IField>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file && req.method === "PATCH") return next();

    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError("There is no document with that Id", 404));
    }

    await cloudinary.uploader.destroy(doc.imagePublicId);
    return next();
  });

export { removeImage };
