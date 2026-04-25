import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { Booking } from "../models/bookingModel";
import { Field } from "../models/fieldModel";
import { getPerformanceInsights } from "../utils/getPerformanceInsights";
import { cacheService } from "../services/redisService";

const getDashboardInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let dashboardData: any;
    const cacheKey = "admin-dashboard";
    const data = await cacheService.get(cacheKey);

    if (!data) {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
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
                  $multiply: [
                    { $divide: ["$bookedSlots", "$totalSlots"] },
                    100,
                  ],
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
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" },
            },
            count: { $sum: 1 },
            originalDate: { $first: "$bookingDate" }, 
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            dayOfWeek: { $dayOfWeek: "$originalDate" }, 
            count: 1,
            _id: 0,
          },
        },
      ]);

      const recentBookings = Booking.find()
        .sort("-createdAt")
        .lean()
        .limit(5)
        .populate("client", "name email phone")
        .populate("field", "name image");

      const [
        bookingsData,
        utilRateData,
        fieldsData,
        statusRatio,
        byDay,
        recent,
      ] = await Promise.all([
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
      dashboardData = {
        stats,
        bookingStatusRatio: statusRatio,
        bookingsByDay: byDay,
        recentBookings: recent,
      };

      await cacheService.set(cacheKey, dashboardData, 300);
    } else {
      dashboardData = data;
    }

    res.status(200).json({
      status: "success",
      data: {
        ...dashboardData,
      },
    });
  },
);

const getAnalyticsInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const cacheKey = "manager-analytics";
    const data = await cacheService.get<any>(cacheKey);
    let analyticsData: any;

    if (!data) {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date();
      endOfWeek.setHours(23, 59, 59, 999);

      const newCustomers = Booking.aggregate([
        {
          $group: {
            _id: "$client",
            firstBookingDate: { $min: "$createdAt" },
          },
        },
        {
          $match: {
            firstBookingDate: { $gte: startOfWeek, $lte: endOfWeek },
          },
        },
      ]);

      const returningCustomers = Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfWeek, $lte: endOfWeek },
          },
        },
        {
          $group: {
            _id: "$client",
          },
        },
        {
          $lookup: {
            from: "bookings",
            let: { currentClient: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$client", "$$currentClient"] },
                      { $lt: ["$createdAt", startOfWeek] },
                    ],
                  },
                },
              },
              { $limit: 1 },
            ],
            as: "previousBookings",
          },
        },
        {
          $match: {
            "previousBookings.0": { $exists: true },
          },
        },
        {
          $count: "totalReturning",
        },
      ]);

      const totalCustomerResult = Booking.aggregate([
        {
          $group: {
            _id: "$client",
            totalBooking: { $sum: 1 },
          },
        },
        {
          $count: "totalUniqueClients",
        },
      ]);

      const totalRevenueResult = Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfWeek, $lte: endOfWeek },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
          },
        },
      ]);

      const totalNumOfBookingsResult = Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfWeek, $lte: endOfWeek },
          },
        },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
          },
        },
      ]);

      const startOfTrendPeriod = new Date();
      startOfTrendPeriod.setMonth(startOfTrendPeriod.getMonth() - 7);
      startOfTrendPeriod.setDate(1);
      startOfTrendPeriod.setHours(0, 0, 0, 0);

      const revenueTrendsResult = Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfTrendPeriod },
            status: "confirmed",
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            totalRevenue: { $sum: "$totalPrice" },
            bookingCount: { $sum: 1 },
          },
        },
        {
          $project: {
            month: "$_id",
            totalRevenue: 1,
            bookingCount: 1,
            _id: 0,
          },
        },
        {
          $sort: { month: 1 },
        },
      ]);

      const peakHoursResult = Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfTrendPeriod },
            status: "confirmed",
          },
        },
        {
          $group: {
            _id: { $hour: { date: "$createdAt", timezone: "+02:00" } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            hour: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ]);

      const utilizationResult = Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfTrendPeriod },
            status: "confirmed",
          },
        },
        {
          $group: {
            _id: "$field",
            totalBookings: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "fields",
            localField: "_id",
            foreignField: "_id",
            as: "fieldInfo",
          },
        },
        { $unwind: "$fieldInfo" },
        {
          $project: {
            arenaName: "$fieldInfo.name",
            totalBookings: 1,
            _id: 0,
          },
        },
        { $sort: { totalBookings: -1 } },
      ]);

      const [
        newCustData,
        returningCustData,
        totalCustData,
        totalMoney,
        totalNumOfBookings,
        revenueTrends,
        peakHours,
        utilization,
      ] = await Promise.all([
        newCustomers,
        returningCustomers,
        totalCustomerResult,
        totalRevenueResult,
        totalNumOfBookingsResult,
        revenueTrendsResult,
        peakHoursResult,
        utilizationResult,
      ]);

      const totalNew = newCustData.length;
      const totalReturning = returningCustData[0]?.totalReturning || 0;
      const totalUnique = totalCustData[0]?.totalUniqueClients || 0;

      const totalRev = totalMoney[0]?.totalRevenue || 0;
      const totalCounts = totalNumOfBookings[0]?.totalBookings || 0;
      const avgBookingValue =
        totalCounts > 0 ? Math.ceil(totalRev / totalCounts) : 0;

      const customerRetention =
        totalUnique > 0 ? Math.round((totalReturning / totalUnique) * 100) : 0;

      const stats = {
        newCustomers: totalNew,
        returningCustomers: totalReturning,
        customerRetention,
        avgBookingValue,
      };

      const performanceInsights = getPerformanceInsights(stats);

      analyticsData = {
        stats,
        revenueTrends,
        peakHours,
        utilization,
        performanceInsights,
      };

      await cacheService.set(cacheKey, analyticsData, 300);
    } else {
      analyticsData = data;
    }

    res.status(200).json({
      status: "success",
      data: {
        ...analyticsData,
      },
    });
  },
);

export { getDashboardInfo, getAnalyticsInfo };
