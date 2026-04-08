import { Model as MongooseModel } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { IUser } from "../interfaces/IUser";
import catchAsync from "../utils/catchAsync";
import jwt, { JwtPayload } from "jsonwebtoken";

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

const register = (Model: MongooseModel<IUser>) =>
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

const protect = (Model: MongooseModel<IUser>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1)- Catch Token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return next();
      // Will Handle This Error Later
    }

    // 2)- Token is valid
    const decode = jwt.verify(token!, process.env.JWT_SECRET!) as JwtPayload;

    // 3)- Check if user with id in JWT is exist
    const user = await Model.findById(decode?.id);
    if (!user) {
      return next();
      // Will Handle This Error Later
    }

    if (user.isPasswordChangedAfterLogin(decode?.iat!)) {
      return next();
      // Will Handle This Error Later
    }

    req.user = user;
    console.log(req.user);
    next();
  });

//roles ["manager","assistant"]
const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next();
      // Will Handle This Error Later
    }
    if (req.user.type === "Client" || !roles.includes((req.user as any).role)) {
      return next();
      // Will Handle This Error Later
    }
    next();
  };
};

export { register, login, protect, restrictTo };
