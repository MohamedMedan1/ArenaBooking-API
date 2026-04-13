import { Document } from "mongoose";
import { ITime } from "./ITime";

export interface ITimeSlot extends Document{
  date: Date;
  times: ITime[];
}
