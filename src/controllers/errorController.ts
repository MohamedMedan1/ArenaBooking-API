import { Request, Response, NextFunction } from "express";

interface IError extends Error {
  message: string;
  status?: string;
  statusCode?: number;
  isOperational?: boolean;
}

const handleDevelopmentErrors = (res: Response, err: IError) => {
  const {message,status,statusCode,stack} = err;

  res.status(statusCode!).json({
    status,
    message,
    stack: stack,
  }); 
}

const handleProductionErrors = (res: Response, err: IError) => {
  const {message,status,statusCode} = err;

  if (err.isOperational) {
    res.status(statusCode!).json({
      status,
      message,
    }); 
  }
  else{
    res.status(500).json({
      status:"error",
      message:"Something went very wrong!",
    }); 
  }


}

const globalErrorHandler = (err: IError, req: Request, res: Response, next: NextFunction,) => {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") handleDevelopmentErrors(res, err);
  else if (process.env.NODE_ENV === "production") handleProductionErrors(res, err); 

};

export { globalErrorHandler };
