import { Request,Response,NextFunction } from "express";
import {cloudinary} from "../config/cloudinary"

const uploadImageToCloud = (req:Request, res:Response, next:NextFunction) => {
  if (!req.file || !req.file.buffer) return next();

  const resultOfCloud = cloudinary.uploader.upload_stream(
    { folder: "arenaBooking/categories" },
    (error, result) => {
      if (error) return next(error);
      req.body.image = result?.secure_url;
      req.body.imagePublicId = result?.public_id;
      return next();
    }
  );

  resultOfCloud.end(req.file.buffer);
};

export { uploadImageToCloud };