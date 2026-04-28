import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync";
import { AppError } from "../utils/appError";
import { Booking } from "../models/bookingModel";
import { Email } from "../utils/email";
import { createPaymentIntention } from "../utils/paymob";
import { processFieldSlot } from "../services/fieldService";
import { formatDate } from "../utils/formatDate";
import { getAllDocuments, getDocument } from "./handlerFactory";
import { IBooking } from "../interfaces/IBooking";
import { cacheService } from "../services/redisService";

const getAllBookings = getAllDocuments<IBooking>(Booking, "bookings");
const getBooking = getDocument<IBooking>(Booking, "bookings");

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
        deposit: req.body.deposit,
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

      const orderId = claims?.order_id || obj?.order?.id;
      const existingBooking = await Booking.findOne({
        paymobOrderId: orderId,
      });

      if (existingBooking) {
        return res.status(200).json({
          status: "success",
          message: "Already processed",
        });
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
        deposit: Math.round(amountPaid),
        duration: extras.duration,
        paymobOrderId: orderId,
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
        } catch (emailErr) {
          console.error("Email sending failed:", emailErr);
        }
      }

      await cacheService.delete("bookings"); //remove cache for Bookings
      await cacheService.delete(`myBookings-${extras.userId}`);
      return res.status(200).json({
        status: "success",
        data: newBooking,
        message: "Booking Created",
      });
    }

    res.status(200).json({ status: "success" });
  },
);

const cancelBookingByAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { bookingId } = req.params;
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const booking = await Booking.findById(bookingId).session(session);

      if (!booking) {
        await session.abortTransaction();
        return next(new AppError("There is no booking with that Id", 404));
      }

      const { field, bookingDate, startTime, endTime } = booking;

      await processFieldSlot(
        "unLockField",
        String(field._id),
        String(bookingDate),
        startTime,
        endTime,
        session,
      );

      booking.status = "canceled";
      await booking.save({ session,validateBeforeSave:false });

      await session.commitTransaction();

      await cacheService.delete("bookings");
      await cacheService.delete(`myBookings-${bookingId}`);
      await cacheService.delete(`myBookings-${booking.client}`);

      res.status(200).json({
        status: "success",
        message: "Booking canceled and slot is now available.",
      });
    } catch (error) {
      await session.abortTransaction();
      return next(error);
    } finally {
      session.endSession();
    }
  },
);

const markAsPaidByAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { bookingId } = req.params;

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { isPaid: true, status: "completed" },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedBooking) {
      return next(new AppError("No booking found with that ID", 404));
    }

    await cacheService.delete(`bookings`);
    await cacheService.delete(`myBookings-${bookingId}`);
    await cacheService.delete(`myBookings-${updatedBooking.client}`);

    res.status(200).json({
      status: "success",
      data: updatedBooking,
    });
  },
);

export {
  getAllBookings,
  getBooking,
  createNewBooking,
  paymobWebhook,
  cancelBookingByAdmin,
  markAsPaidByAdmin,
};
