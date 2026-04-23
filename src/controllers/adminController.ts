import { NextFunction, Request, Response } from "express";
import { APIFeatures } from "../utils/apiFeatures";
import { cacheService } from "../services/redisService";
import Admin from "../models/adminModel";
import {
  createNewDocument,
  deleteDocument,
  getAllDocuments,
  getUser,
  updateUser,
} from "./handlerFactory";
import { IAdmin } from "../interfaces/IAdmin";
import catchAsync from "../utils/catchAsync";

const getAllAssistants = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const cacheKey =
      Object.keys(req.query).length > 0
        ? `admins:${JSON.stringify(req.query)}`
        : "admins";
    const data: IAdmin[] | null = await cacheService.get<IAdmin[]>(cacheKey);
    let allDocuments: IAdmin[];

    if (!data) {
      const features = new APIFeatures(Admin.find({ _id: { $ne: req.user!._id } }).lean(), req.query)
        .filter()
        .sort()
        .limit()
        .fields()
        .paginate();
      allDocuments = await features.query;
      await cacheService.set(cacheKey, allDocuments, 3600);
    } else {
      allDocuments = data;
    }

    res.status(200).json({
      status: "success",
      result: allDocuments.length,
      data: allDocuments,
    });
  },
);

const createNewAssistant = createNewDocument<IAdmin>(Admin, "admins");
const deleteAssistant = deleteDocument<IAdmin>(Admin, "admins");

const getMe = getUser(Admin);
const updateMe = updateUser(Admin);

export {
  getAllAssistants,
  createNewAssistant,
  deleteAssistant,
  getMe,
  updateMe,
};
