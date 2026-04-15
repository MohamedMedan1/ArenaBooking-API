import { ClientSession } from "mongoose";
import { Field } from "../models/fieldModel";

export const processFieldSlot = async (
  processJob: string,
  fieldId: string,
  bookingDateStr: string,
  startTime: string,
  endTime: string,
  session: ClientSession,
):Promise<any> => {
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
            isBooked: processJob === "lockField" ? false : true,
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

  let calculatedData = {};

  if (timeSlot) {
    if (processJob === "lockField") {
      timeSlot.isBooked = true;
      calculatedData = {
        nightCost: timeSlot.nightCost,
        duration: timeSlot.duration,
        totalPrice: field.pricePerHour * timeSlot.duration + timeSlot.nightCost,
      };
    } else if (processJob === "unLockField") {
      timeSlot.isBooked = false;
    }

    field.markModified("timeSlots");
    await field.save({ session });

    if (Object.keys(calculatedData).length) {
      return { field, calculatedData };
    } else return field;
  }

  return null;
};
