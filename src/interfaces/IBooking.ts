import { Document, Types } from "mongoose";

export interface IBooking extends Document {
  bookingNumber: string;
  field: Types.ObjectId;
  client: Types.ObjectId;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  deposit: number;
  remaining: number;
  status: string;
  isPaid: boolean;
  paymobOrderId: string;
}
