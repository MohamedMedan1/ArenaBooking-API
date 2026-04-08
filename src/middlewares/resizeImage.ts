import { Request, Response, NextFunction } from "express";
import sharp from "sharp";
import catchAsync from "../utils/catchAsync";

const resizeImage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file || req.file.fieldname !== "image") return next();

  const resizedBuffer = await sharp(req.file.buffer)
    .resize({
      width: 1200,
      height: 800,
      fit: "cover",
      position: "center"
    })
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toBuffer();
  
  req.file.buffer = resizedBuffer;
  next();
});

export { resizeImage };