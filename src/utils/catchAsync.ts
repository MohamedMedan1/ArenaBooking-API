import { Request, Response, NextFunction, RequestHandler } from "express";

// Generic function to wrap async functions
const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); 
  };
};

export default catchAsync;