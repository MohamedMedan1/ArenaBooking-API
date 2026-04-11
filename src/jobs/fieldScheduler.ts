import cron from "node-cron";
import { Field } from "../models/fieldModel";
import { generateSlots } from "../utils/generateSlots";

export const fieldJob = () => {
  cron.schedule("0 0 * * *", async () => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
    targetDate.setHours(0, 0, 0, 0);

    const fields = await Field.find({
      lastSlotAvailable: { $lte: targetDate },
    });
    const fieldsUpdates:any = [];

    for (const field of fields) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); 
      const startDate = new Date(field.lastSlotAvailable);
      startDate.setDate(startDate.getDate() + 1);
      
      const { timeSlots, lastSlotAvailable } = generateSlots(
        7,
        field.pricePerHour,
        startDate,
        0.1,
      );

      const fieldUpdate = {
        updateOne: {
          filter: { _id: field._id },
          update: {
            $pull: {
              timeSlots: {
                date:{$lt: today}
              }
            },
            $push: {
              timeSlots: {
                $each: timeSlots,
              },
            },
            $set: {
              lastSlotAvailable
            }
          },
        },
      };

      fieldsUpdates.push(fieldUpdate);
    }

    await Field.bulkWrite(fieldsUpdates);
  });
};
