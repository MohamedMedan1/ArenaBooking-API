import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync";
import { Field } from "../models/fieldModel";
import { AppError } from "../utils/appError";
import { Booking } from "../models/bookingModel";
import { Email } from "../utils/email";
import { createPaymentIntention } from "../utils/paymob";

// const createNewBooking = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const session = await mongoose.startSession();

//     try {
//       session.startTransaction();

//       const { field: fieldId } = req.body;

//       const filter = {
//         _id: fieldId as string,
//         timeSlots: {
//           $elemMatch: {
//             date: new Date(req.body.bookingDate),
//             times: {
//               $elemMatch: {
//                 startTime: req.body.startTime,
//                 endTime: req.body.endTime,
//                 isBooked: false,
//               },
//             },
//           },
//         },
//       };

//       const field = await Field.findOne(filter).session(session);

//       if (!field) {
//         return next(
//           new AppError(
//             "There is no field with that Id and with that info",
//             404,
//           ),
//         );
//       }

//       const daySlot = field.timeSlots.find(
//         (slot) =>
//           slot.date.toISOString() ===
//           new Date(req.body.bookingDate).toISOString(),
//       );

//       const timeSlot = daySlot?.times.find(
//         (t) =>
//           t.startTime === req.body.startTime && t.endTime === req.body.endTime,
//       );

//       if (timeSlot) {
//         timeSlot.isBooked = true;

//         req.body.nightCost = timeSlot.nightCost;
//         req.body.duration = timeSlot.duration;
//         req.body.totalPrice =
//           field.pricePerHour * timeSlot.duration + timeSlot.nightCost;
//       }

//       field.markModified("timeSlots");
//       await field.save({ session });

//       const bookingInfo = {
//         ...req.body,
//         totalPrice: field.pricePerHour * req.body.duration + req.body.nightCost,
//         deposite: req.body.deposite,
//       };

//       const paymentIntention = await createPaymentIntention(
//         bookingInfo,
//         req.user,
//       );

//       const newBooking = await Booking.create([req.body], { session });
//       const bookingData = newBooking[0]!.toObject();
//       const formattedData = {
//         ...bookingData,
//         bookingDate: new Date(bookingData.bookingDate).toLocaleDateString(
//           "en-GB",
//           {
//             weekday: "long",
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//           },
//         ),
//       };
//       new Email({
//         email: req.user!.email,
//         name: req.user!.name,
//       }).sendBookingSuccess(formattedData);

//       res.status(201).json({
//         status: "success",
//         paymentUrl: `https://accept.paymob.com/unifiedcheckout/?publicKey=${process.env.PAYMOB_PUBLIC_KEY}&clientToken=${paymentIntention.client_token}`,
//         data: newBooking,
//       });

//       await session.commitTransaction();
//     } catch (error) {
//       await session.abortTransaction();
//       return next(error);
//     } finally {
//       session.endSession();
//     }
//   },
// );

const createNewBooking = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const { field: fieldId } = req.body;
      const filter = {
        _id: fieldId as string,
        timeSlots: {
          $elemMatch: {
            date: new Date(req.body.bookingDate),
            times: {
              $elemMatch: {
                startTime: req.body.startTime,
                endTime: req.body.endTime,
                isBooked: false,
              },
            },
          },
        },
      };

      const field = await Field.findOne(filter).session(session);

      if (!field) {
        return next(
          new AppError(
            "There is no field with that Id and with that info",
            404,
          ),
        );
      }

      const daySlot = field.timeSlots.find(
        (slot) =>
          slot.date.toISOString() ===
          new Date(req.body.bookingDate).toISOString(),
      );

      const timeSlot = daySlot?.times.find(
        (t) =>
          t.startTime === req.body.startTime && t.endTime === req.body.endTime,
      );

      if (timeSlot) {
        timeSlot.isBooked = true;
        req.body.nightCost = timeSlot.nightCost;
        req.body.duration = timeSlot.duration;
        req.body.totalPrice =
          field.pricePerHour * timeSlot.duration + timeSlot.nightCost;
      }

      // field.markModified("timeSlots");
      // await field.save({ session });

      const bookingInfo = {
        ...req.body,
        totalPrice: field.pricePerHour * req.body.duration + req.body.nightCost,
        deposite: req.body.deposite,
      };

      const paymentIntention = await createPaymentIntention(
        bookingInfo,
        req.user,
      );
      await session.commitTransaction();
      res.status(200).json({
        status: "success",
        paymentUrl: `https://accept.paymob.com/unifiedcheckout/?publicKey=${process.env.PAYMOB_PUBLIC_KEY}&clientToken=${paymentIntention.client_secret}`,
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

    if (obj.success === true) {
      const { extras } = obj.payment_methods[0].intention;

      const newBooking = await Booking.create({
        field: extras.fieldId,
        client: extras.userId,
        bookingDate: new Date(extras.bookingDate),
        startTime: extras.startTime,
        endTime: extras.endTime,
        totalPrice: extras.totalPrice,
        deposite: Math.round(obj.amount / 100),
        duration: extras.duration,
      });

      const bookingData = newBooking.toObject();
      const formattedData = {
        ...bookingData,
        bookingDate: new Date(bookingData.bookingDate).toLocaleDateString(
          "en-GB",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        ),
      };

      new Email({
        email: obj.billing_data.email,
        name: obj.billing_data.first_name,
      }).sendBookingSuccess(formattedData);

      return res
        .status(200)
        .json({
          status: "success",
          data: newBooking,
          message: "Booking Created",
        });
    }

    res.status(200).json({ status: "success" });
  },
);

export { createNewBooking, paymobWebhook };
