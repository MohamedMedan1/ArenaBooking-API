import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync";
import { AppError } from "../utils/appError";
import { Booking } from "../models/bookingModel";
import { Email } from "../utils/email";
import { createPaymentIntention } from "../utils/paymob";
import { processFieldSlot } from "../services/fieldService";
import { formatDate } from "../utils/formatDate";

const createNewBooking = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const result = await processFieldSlot(
        "lockField",
        req.body.field,
        req.body.bookingDate,
        req.body.startTime,
        req.body.endTime,
        session,
      );

      if (!result)
        return next(new AppError("Field not found or slot taken", 404));

      const { field, calculatedData } = result;

      req.body.totalPrice = calculatedData.totalPrice;
      req.body.duration = calculatedData.duration;

      const bookingInfo = {
        ...req.body,
        totalPrice:
          field.pricePerHour * calculatedData.duration +
          calculatedData.nightCost,
        deposite: req.body.deposite,
      };

      const paymentIntention = await createPaymentIntention(
        bookingInfo,
        req.user,
      );
      await session.commitTransaction();
      res.status(200).json({
        status: "success",
        paymentUrl: `https://accept.paymob.com/unifiedcheckout/?publicKey=${process.env.PAYMOB_PUBLIC_KEY}&clientSecret=${paymentIntention.client_secret}`,
      });
    } catch (error) {
      await session.abortTransaction();
      return next(error);
    } finally {
      session.endSession();
    }
  },
);

const paymobWebhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { obj } = req.body;

    console.log(obj);
    if (obj && obj.success === true) {
      const claims = obj.payment_key_claims;
      const extras = claims?.extra;
      const billingData = claims?.billing_data;

      if (!extras) {
        console.error("❌ Extras not found in payment_key_claims");
        return res
          .status(200)
          .json({ status: "success", message: "No extras" });
      }

      const amountPaid =
        (claims?.amount_cents || obj.order?.amount_cents || 0) / 100;

      const newBooking = await Booking.create({
        field: extras.fieldId,
        client: extras.userId,
        bookingDate: new Date(extras.bookingDate),
        startTime: extras.startTime,
        endTime: extras.endTime,
        totalPrice: extras.totalPrice,
        deposite: Math.round(amountPaid),
        duration: extras.duration,
      });

      const bookingData = newBooking.toObject();
      const formattedData = {
        ...bookingData,
        bookingDate: formatDate(bookingData.bookingDate),
      };

      if (billingData?.email) {
        try {
          await new Email({
            email: billingData.email,
            name: billingData.first_name,
          }).sendBookingSuccess(formattedData);
          console.log("Email sent successfully to:", billingData.email);
        } catch (emailErr) {
          console.error("Email sending failed:", emailErr);
        }
      }

      return res.status(200).json({
        status: "success",
        data: newBooking,
        message: "Booking Created",
      });
    }

    res.status(200).json({ status: "success" });
  },
);

export { createNewBooking, paymobWebhook };
