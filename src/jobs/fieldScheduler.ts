import cron from "node-cron";
import { Field } from "../models/fieldModel";
import { generateSlots } from "../utils/generateSlots";

export const fieldJob = () => {
  const cronTime = process.env.FIELD_JOB_CRON || "0 0 * * *";

  cron.schedule(cronTime, async () => {
    console.log("⏰ [Cron Job] Starting automated slots generation...");

    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 2);
      targetDate.setHours(0, 0, 0, 0);

      const fields = await Field.find({
        lastSlotAvailable: { $lte: targetDate },
      });

      if (!fields || fields.length === 0) {
        console.log("💤 [Cron Job] No fields need slots update today.");
        return;
      }

      const fieldsUpdates: any = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      for (const field of fields) {
        const startDate = new Date(field.lastSlotAvailable);
        startDate.setDate(startDate.getDate() + 1);
        
        const { timeSlots: newTimeSlots, lastSlotAvailable } = generateSlots(
          7,
          field.pricePerHour,
          startDate,
          0.1,
        );

        const filteredOldSlots = field.timeSlots.filter(
          (slot: any) => new Date(slot.date) >= today
        );

        const updatedTimeSlots = [...filteredOldSlots, ...newTimeSlots];

        const fieldUpdate = {
          updateOne: {
            filter: { _id: field._id },
            update: {
              $set: {
                timeSlots: updatedTimeSlots, 
                lastSlotAvailable
              }
            },
          },
        };

        fieldsUpdates.push(fieldUpdate);
      }

      if (fieldsUpdates.length > 0) {
        const result = await Field.bulkWrite(fieldsUpdates);
        console.log(`✅ [Cron Job] Successfully updated ${result.modifiedCount} fields.`);
      }

    } catch (error) {
      console.error("❌ [Cron Job Error] Something went wrong inside the job:", error);
    }
  });
};


