import { Document, Types } from "mongoose";

interface ITime {
  startDate: Date;
  endDate: Date;
  duration: number;
  isBooked: boolean;
  atNight: boolean;
  nightCost: number;
}

interface ITimeSlot {
  date: Date;
  time: ITime[];
}

export interface IField extends Document {
  image: string;
  name: string;
  capacity: number;
  pricePerHour: number;
  timeSlots: ITimeSlot[];
  category: Types.ObjectId;
  rating?: number;
  createdAt: Date;
}
