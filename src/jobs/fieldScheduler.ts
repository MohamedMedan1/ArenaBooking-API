import cron from "node-cron";

export const fieldJob = () => {
  cron.schedule("**0**", () => {
    console.log("Checking fields to update slots...");
  });
};
