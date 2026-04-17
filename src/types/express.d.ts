import { IBooking } from "../interfaces/IBooking";
import { IField } from "../interfaces/IField";
import { IUser } from "../interfaces/IUser";
import { Request } from "express";

// Extend the Express Request interface
declare module "express-serve-static-core" {
  interface Request {
    user?: IUser; // optional because it might not exist yet
    booking?: IBooking; // optional because it might not exist yet
    field?: IField; // optional because it might not exist yet
  }
}
