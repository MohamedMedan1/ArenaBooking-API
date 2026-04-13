import { Document } from "mongoose";

export interface ITime extends Document {
  startTime: string;
  endTime: string;
  duration: number;
  isBooked: boolean;
  atNight: boolean;
  nightCost: number;
}
