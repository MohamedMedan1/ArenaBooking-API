import { IUser } from "../interfaces/IUser";
import { Request } from "express";

// Extend the Express Request interface
declare module "express-serve-static-core" {
  interface Request {
    user?: IUser; // optional because it might not exist yet
  }
}
