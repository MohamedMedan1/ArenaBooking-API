import { Request, Response, NextFunction } from "express";

const insertFieldAndClientIds = (req: Request, res: Response, next: NextFunction) => {
  const { fieldId } = req.params;
  req.body.field = fieldId;
  req.body.client = req.user!._id;

  next();
};

export { insertFieldAndClientIds };
