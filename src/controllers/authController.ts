import {Model as MongooseModel} from "mongoose"
import { IUser } from "../interfaces/IUser";
import catchAsync from "../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const generateJWTAndSendResponse = (
  res: Response,
  user: IUser,
  statusCode: number,
) => {
  const token: string = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });

  res.status(statusCode).json({
    status: "success",
    token,
    data: user,
  });
};

const register = (Model:MongooseModel<IUser>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await Model.create(req.body);

    generateJWTAndSendResponse(res, newUser, 201);
  });

const login = (Model: MongooseModel<IUser>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next();
      // Will Handle This Error Later
    }

    // 1)- Check if email is already exist
    const user = await Model.findOne({ email }).select("+password");

    if (!user || !(await user.isCorrectPassword(password))) {
      return next();
      // Will Handle This Error Later
    }

    generateJWTAndSendResponse(res, user, 200);
  });

export { register, login };
