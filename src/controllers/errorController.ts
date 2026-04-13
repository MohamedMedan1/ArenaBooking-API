import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

interface IError extends Error {
  message: string;
  status?: string;
  statusCode?: number;
  isOperational?: boolean;
  code?: number;
}

const handleDevelopmentErrors = (res: Response, err: IError) => {
  const { message, status, statusCode, stack } = err;

  res.status(statusCode!).json({
    status,
    message,
    stack: stack,
  });
};
const handleDuplicationKeyError = (err: any) => {
  const duplicatedFields = Object.keys(err.keyPattern);
  const messages = duplicatedFields.map(
    (curField) =>
      `Duplicate ${curField} value entered. Please use another value.`,
  );
  return new AppError(messages.join(" "), 400);
};

const handleValidationError = (err: any) => {
  const failedFields = Object.keys(err.errors);
  const messages = failedFields.map((curField) => err.errors[curField].message);
  return new AppError(messages.join(" , "), 400);
};

const handleCastError = (err: any) =>
  new AppError(`Invalid ID : ${err.value}`, 400);

const handleTokenValidationError = () => new AppError("Invalid Token", 401);

const handleTokenExpiredError = () =>
  new AppError("Token was expired please, log in", 401);

const handleProductionErrors = (res: Response, err: IError) => {
  const { message, status, statusCode } = err;

  if (err.isOperational) {
    res.status(statusCode!).json({
      status,
      message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

const globalErrorHandler = (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  if (err.code === 11000) err = handleDuplicationKeyError(err);
  if (err.name === "ValidationError") err = handleValidationError(err);
  if (err.name === "CastError") err = handleCastError(err);
  if (err.name === "JsonWebTokenError") err = handleTokenValidationError();
  if (err.name === "TokenExpiredError") err = handleTokenExpiredError();

  if (process.env.NODE_ENV === "development") handleDevelopmentErrors(res, err);
  else if (process.env.NODE_ENV === "production")
    handleProductionErrors(res, err);
};

export { globalErrorHandler };
