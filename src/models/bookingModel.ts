import { Schema, model } from "mongoose";
import { IBooking } from "../interfaces/IBooking";

const bookingSchema = new Schema<IBooking>(
  {
    bookingNumber: {
      type: String,
      unique: true,
      min: 1,
    },
    field: {
      type: Schema.Types.ObjectId,
      ref: "Field",
      required: [true, "Please provide field Id !"],
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Please provide client Id !"],
    },
    bookingDate: {
      type: Date,
      required: [true, "Please provide a date of Booking"],
    },
    startTime: {
      type: String,
      required: [true, "Please provide a startTime of Booking"],
    },
    endTime: {
      type: String,
      required: [true, "Please provide a endTime of Booking"],
    },
    duration: {
      type: Number,
      required: [true, "Please provide a duration of Booking"],
      min: [1, "Booking duration can be at least 1 hour"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Please provide total price of Booking"],
    },
    deposite: {
      type: Number,
      required: [true, "Please provide deposite of Booking"],
    },
    remaining: {
      type: Number,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "confirmed",
      enum: {
        values: ["confirmed", "completed", "canceled"],
        message: "status can be only confirmed | completed | canceled",
      },
    },
  },
  { timestamps: true },
);

bookingSchema.pre<IBooking>("save", function () {
  this.remaining = this.totalPrice - this.deposite;

  if (!this.bookingNumber) {
    this.bookingNumber = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
  }
});

const Booking = model<IBooking>("Booking", bookingSchema);
export { Booking };
