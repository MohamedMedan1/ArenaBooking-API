import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";

const createNewBooking = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    res.status(200).json({
      status: "success",
    });
  },
);

export { createNewBooking};
