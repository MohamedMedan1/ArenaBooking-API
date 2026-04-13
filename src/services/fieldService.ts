import { ClientSession } from "mongoose";
import { Field } from "../models/fieldModel";

export const processFieldSlot = async (
  fieldId: string,
  bookingDateStr: string,
  startTime: string,
  endTime: string,
  session: ClientSession,
) => {
  const bookingDate = new Date(bookingDateStr);

  const filter = {
    _id: fieldId,
    timeSlots: {
      $elemMatch: {
        date: bookingDate,
        times: {
          $elemMatch: {
            startTime,
            endTime,
            isBooked: false,
          },
        },
      },
    },
  };

  const field = await Field.findOne(filter).session(session);

  if (!field) return null;

  const daySlot = field.timeSlots.find(
    (slot) => slot.date.toISOString() === bookingDate.toISOString(),
  );

  const timeSlot = daySlot?.times.find(
    (t) => t.startTime === startTime && t.endTime === endTime,
  );

  if (timeSlot) {
    timeSlot.isBooked = true;  
    const calculatedData = {
      nightCost: timeSlot.nightCost,
      duration: timeSlot.duration,
      totalPrice: field.pricePerHour * timeSlot.duration + timeSlot.nightCost,
    };

    field.markModified("timeSlots");
    await field.save({ session });

    return { field, calculatedData };
  }

  return null;
};