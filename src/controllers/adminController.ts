import { Request,Response,NextFunction } from "express";
import Admin from "../models/adminModel";
import catchAsync from "../utils/catchAsync";
import { getUser, updateUser } from "./handlerFactory";
import { APIFeatures } from "../utils/apiFeatures";

const getAllAssistants = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const features = new APIFeatures(Admin.find({ _id: { $ne: req.user!._id } }), req.query)
      .filter()
      .sort()
      .fields()
      .paginate();
    const allAssistants = await features.query;

    res.status(200).json({
      status: "success",
      result: allAssistants.length,
      data:allAssistants
    });
  }
);

const createNewAssistant = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newAssistant = await Admin.create(req.body);
    
    res.status(201).json({
      status: "success",
      data: newAssistant
    });
  }
);

const deleteAssistant  = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await Admin.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: "success",
      message: "Assistant was deleted successfully!"
    });
  }
);

const getMe = getUser(Admin);
const updateMe = updateUser(Admin);

export {getAllAssistants,createNewAssistant,deleteAssistant, getMe, updateMe };
