import cron from "node-cron";
import { Field } from "../models/fieldModel";
import { generateSlots } from "../utils/generateSlots";

export const fieldJob = () => {
  let cronTime = process.env.FIELD_JOB_CRON || "0 0 * * *";

  cron.schedule(cronTime, async () => {
    console.log("⏰ [Cron Job] Starting automated slots management...");

    try {
      const fields = await Field.find({});

      if (!fields || fields.length === 0) {
        console.log("[Cron Job] No fields found in database.");
        return;
      }

      const fieldsUpdates: any = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 2);
      targetDate.setHours(0, 0, 0, 0);

      for (const field of fields) {
        let updatedTimeSlots = field.timeSlots.filter(
          (slot: any) => new Date(slot.date) >= today
        );

        let currentLastSlot:any = new Date(field.lastSlotAvailable);
        let currentLastSlotCheck = new Date(field.lastSlotAvailable);
        currentLastSlotCheck.setHours(0, 0, 0, 0);

        if (currentLastSlotCheck <= targetDate) {
          const startDate = new Date(currentLastSlot);
          startDate.setDate(startDate.getDate() + 1);
          
          const {timeSlots: newTimeSlots, lastSlotAvailable} = generateSlots(
            7,
            field.pricePerHour,
            startDate,
            0.1,
          );

          updatedTimeSlots = [...updatedTimeSlots, ...newTimeSlots];
          currentLastSlot = lastSlotAvailable;
        }

        const fieldUpdate = {
          updateOne: {
            filter: { _id: field._id },
            update: {
              $set: {
                timeSlots: updatedTimeSlots, 
                lastSlotAvailable: currentLastSlot
              }
            },
          },
        };

        fieldsUpdates.push(fieldUpdate);
      }

      if (fieldsUpdates.length > 0) {
        const result = await Field.bulkWrite(fieldsUpdates);
        console.log(`✅ [Cron Job] Database Sync Done. Processed ${result.modifiedCount} fields.`);
      }

    } catch (error) {
      console.error("❌ [Cron Job Error] Something went wrong inside the job:", error);
    }
  });
};