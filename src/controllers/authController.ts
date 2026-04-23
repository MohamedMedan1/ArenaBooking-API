import { Model as MongooseModel } from "mongoose";
import { CookieOptions } from "express";
import { Request, Response, NextFunction } from "express";
import { IUser } from "../interfaces/IUser";
import catchAsync from "../utils/catchAsync";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "../utils/appError";

const generateJWTAndSendResponse = (
  res: Response,
  user: IUser,
  statusCode: number,
) => {
  const token: string = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "30d") as any,
  })!;

  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions:CookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };

  res.cookie("jwt", token, cookieOptions);

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(statusCode).json({
    status: "success",
    data: userResponse,
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
      return next(new AppError("Please provide your email and password", 400));
    }

    // 1)- Check if email is already exist
    const user = await Model.findOne({ email }).select("+password");

    if (!user || !(await user.isCorrectPassword(password))) {
      return next(new AppError("Your email or password is incorrect!", 400));
    }

    generateJWTAndSendResponse(res, user, 200);
  });

const logout = (req: Request, res: Response, next: NextFunction)  => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), 
    httpOnly: true,
    sameSite: isProduction? 'none' : 'lax',
    secure: isProduction,
  });
  res.status(200).json({ status: 'success' });
}

const protect = (Model: MongooseModel<IUser>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1)- Catch Token
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token)
      return next(new AppError("You are not logged in! Please log in.", 401));

    // 2)- Token is valid
    const decode = jwt.verify(token!, process.env.JWT_SECRET!) as JwtPayload;

    // 3)- Check if user with id in JWT is exist
    const user = await Model.findById(decode?.id);
    if (!user) {
      return next(new AppError("There is no user with that Id", 404));
    }

    if (user.isPasswordChangedAfterLogin(decode?.iat!)) {
      return next(
        new AppError(
          "You changed password after login please, log in again",
          401,
        ),
      );
    }

    req.user = user;
    next();
  });

//roles ["manager","assistant"]
const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("You are not logged in! Please log in.", 401));
    }
    if (req.user.type === "Client" || !roles.includes((req.user as any).role)) {
      return next(
        new AppError("You are not authorized to perform that action", 403),
      );
    }
    next();
  };
};

const changePassword = (Model: MongooseModel<IUser>) =>
  catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return next(
        new AppError(
          "Please provide your currentPassword , newPassword and newPasswordConfirm",
          400,
        ),
      );
    }

    const user = await Model.findById(req.user!._id).select("+password");

    if (!user) {
      return next(new AppError("There is no user with that Id", 404));
    }

    if (!(await user.isCorrectPassword(currentPassword))) {
      return next(new AppError("Your current password is in correct", 400));
    }

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();

    generateJWTAndSendResponse(res, user, 200);
  });

export { register, login,logout, protect, restrictTo, changePassword };
