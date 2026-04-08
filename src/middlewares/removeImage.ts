import { Request,Response,NextFunction } from "express";
import {cloudinary} from "../config/cloudinary"
import catchAsync from "../utils/catchAsync";
import Category from "../models/categoryModel";
import { AppError } from "../utils/appError";

const removeImage = catchAsync(async(req: Request, res: Response, next: NextFunction) => {  
    if (!req.file && req.method === "PATCH") return next();

  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return next(new AppError("There is no category with that Id", 404));
  }

  await cloudinary.uploader.destroy(category.imagePublicId);
  return next();
});

export { removeImage };