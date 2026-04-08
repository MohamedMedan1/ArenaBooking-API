import multer,{ FileFilterCallback } from "multer";
import { AppError } from "../utils/appError";
import { Request } from "express";

const memoryStorage = multer.memoryStorage();

const filterImages = (req:Request,file:Express.Multer.File,cb:FileFilterCallback) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  }
  else {
    cb(new AppError("Only images are allowed", 403));
  }

}

const upload = multer({ storage: memoryStorage,fileFilter:filterImages });
const uploadImage = upload.single("image");

export { uploadImage };
