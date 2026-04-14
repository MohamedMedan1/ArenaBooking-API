import { Request, Response, NextFunction } from "express";

export const insertQueryString =
  (key: string, value: string) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.query[key] = value;
    next();
  };
