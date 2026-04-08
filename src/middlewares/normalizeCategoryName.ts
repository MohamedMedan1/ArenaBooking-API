import { Request,Response,NextFunction } from "express";

export const normalizeCategoryName = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.name) return next();
  
  const nameWithoutSpaces = req.body.name.trim();
  
  if (nameWithoutSpaces) {
    const normalizedName = nameWithoutSpaces.slice(0, 1).toUpperCase() + nameWithoutSpaces.slice(1).toLowerCase();
    req.body.name = normalizedName;
  }

  next();
}
