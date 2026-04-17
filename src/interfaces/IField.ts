import { Document, Types } from "mongoose";
import { ITimeSlot } from "./ITimeSlot";

export interface IField extends Document {
  image: string;
  imagePublicId: string;
  name: string;
  capacity: number;
  pricePerHour: number;
  timeSlots: ITimeSlot[];
  category: Types.ObjectId;
  rating?: number;
  lastSlotAvailable: Date;
  isActive: boolean;
}
