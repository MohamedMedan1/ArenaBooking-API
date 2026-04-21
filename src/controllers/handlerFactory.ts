import { Model as MongooseModel } from "mongoose";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { filterFields } from "../utils/filterFields";
import { AppError } from "../utils/appError";
import { IUser } from "../interfaces/IUser";
import { APIFeatures } from "../utils/apiFeatures";

const getAllDocuments = <T>(Model: MongooseModel<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .fields()
      .paginate();

    const allDocuments = await features.query;

    res.status(200).json({
      status: "success",
      result: allDocuments.length,
      data: allDocuments,
    });
  });

const getDocument = <T>(Model: MongooseModel<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const document = await Model.findById(req.params.id);

    if (!document)
      return next(new AppError("There is no document with that Id", 404));

    res.status(200).json({
      status: "success",
      data: document,
    });
  });

const createNewDocument = <T>(Model: MongooseModel<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const newDocument = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: newDocument,
    });
  });

const updateDocument = <T>(Model: MongooseModel<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const updatedDocument = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedDocument)
      return next(new AppError("There is no document with that Id", 404));

    res.status(200).json({
      status: "success",
      data: updatedDocument,
    });
  });

const deleteDocument = <T>(Model: MongooseModel<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError("No document found with that ID", 404));

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

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

export {
  getAllDocuments,
  getDocument,
  createNewDocument,
  updateDocument,
  deleteDocument,
  getUser,
  updateUser,
};
