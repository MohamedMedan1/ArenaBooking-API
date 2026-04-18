import { Model as MongooseModel } from "mongoose";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { filterFields } from "../utils/filterFields";
import { AppError } from "../utils/appError";
import { IUser } from "../interfaces/IUser";

const getUser = (Model: MongooseModel<IUser>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const me = await Model.findById(req.user!._id);

    if (!me) {
      return next(new AppError("There is no user With that Id", 404));
    }

    res.status(200).json({
      status: "success",
      data: me,
    });
  });

const updateUser = (Model: MongooseModel<IUser>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          `You cannot change your password from that API: ${req.originalUrl} `,
          401,
        ),
      );
    }

    req.body = filterFields(req.body, "name", "email", "phone");

    const user = await Model.findById(req.user!._id);

    if (!user) return next(new AppError("There is no user With that Id", 404));
  
    Object.assign(user, req.body);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      data: user,
      message: "Your information has been updated successfully!",
    });
  });

export { getUser, updateUser };
