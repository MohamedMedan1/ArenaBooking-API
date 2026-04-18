import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { Booking } from "../models/bookingModel";
import { Field } from "../models/fieldModel";

const getDashboardInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date();
    endOfWeek.setHours(23, 59, 59, 999);

    const bookingsStats = Booking.aggregate([
      {
        $match: {
          status: "confirmed",
          createdAt: { $gte: startOfWeek, $lte: endOfWeek },
        },
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    const utilizationRate = Field.aggregate([
      {
        $match: {
          isActive: true,
        },
      },
      {
        $unwind: "$timeSlots",
      },
      {
        $unwind: "$timeSlots.times",
      },
      {
        $group: {
          _id: null,
          totalSlots: { $sum: 1 },
          bookedSlots: {
            $sum: {
              $cond: [{ $eq: ["$timeSlots.times.isBooked", true] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          rate: {
            $cond: [
              { $eq: ["$totalSlots", 0] },
              0,
              {
                $multiply: [{ $divide: ["$bookedSlots", "$totalSlots"] }, 100],
              },
            ],
          },
        },
      },
    ]);

    const fieldStats = Field.aggregate([
      {
        $match: {
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          activeFields: { $sum: 1 },
        },
      },
    ]);

    const bookingStatusRatio = Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    const bookingsByDay = Booking.aggregate([
      {
        $group: {
          _id: "$bookingDate",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          dayNumber: { $dayOfWeek: "$_id" },
          count: 1,
          _id: 0,
        },
      },
    ]);

    const recentBookings = Booking.find().sort("-createdAt").limit(5);

    const [bookingsData, utilRateData, fieldsData, statusRatio, byDay, recent] =
      await Promise.all([
        bookingsStats,
        utilizationRate,
        fieldStats,
        bookingStatusRatio,
        bookingsByDay,
        recentBookings,
      ]);

    const stats = {
      totalBookings: bookingsData[0]?.totalBookings || 0,
      totalRevenue: bookingsData[0]?.totalRevenue || 0,
      activeFields: fieldsData[0]?.activeFields || 0,
      utilizationRate: utilRateData[0]?.rate || 0,
    };

    res.status(200).json({
      status: "success",
      data: {
        stats,
        bookingStatusRatio: statusRatio,
        bookingsByDay: byDay,
        recentBookings: recent,
      },
    });
  },
);

export { getDashboardInfo };