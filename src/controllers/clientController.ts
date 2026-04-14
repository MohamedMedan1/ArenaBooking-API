import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import Client from "../models/clientModel";
import { AppError } from "../utils/appError";
import { Email } from "../utils/email";

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const me = await Client.findById(req.user!._id);

    if (!me) {
      return next(new AppError("There is no user With that Id", 404));
    }

    res.status(200).json({
      status: "success",
      data: me,
    });
  },
);

const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone } = req.body;
    const updatedData = { name, email, phone };

    if (req.body.password) {
      return next(
        new AppError(
          `You cannot change your password from that API: ${req.originalUrl} `,
          401,
        ),
      );
    }

    const client = await Client.findById(req.user!._id);

    if (!client) {
      return next(new AppError("There is no user With that Id", 404));
    }

    Object.assign(client,updatedData);
    await client.save();

    res.status(200).json({
      status: "success",
      data: client,
      message: "Your information has been updated successfully!",
    });
  },
);

export { getMe, updateMe };
