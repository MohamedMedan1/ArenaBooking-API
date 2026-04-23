import { ITimeSlot } from "../interfaces/ITimeSlot";

interface INewTime {
  startTime: string;
  endTime: string;
  duration: number;
  isBooked: boolean;
  atNight: boolean;
  nightCost: number;
}

const generateSlots = (
  daysCount: number = 7,
  pricePerHour: number,
  startDate: Date,
  nightPercent: number = 0.1,
) => {
  const currentDate = new Date(startDate);
  const timeSlots = [];
  let lastSlotAvailable;

  for (let i = 1; i <= daysCount; i++) {
    currentDate.setUTCHours(0, 0, 0, 0);
    const newDate = new Date(currentDate);

    const newTimeSlots: ITimeSlot | any = { date: newDate, times: [] };

    for (let hour = 0; hour < 24; hour += 2) {
      const atNight = (hour >= 0 && hour <= 4) || (hour >= 18 && hour <= 22);
      const newTime: INewTime = {
        startTime: `${hour.toString().padStart(2, "0")}:00`,
        endTime: `${(hour + 2 === 24 ? 0 : hour + 2).toString().padStart(2, "0")}:00`,
        duration: 2,
        isBooked: false,
        atNight,
        nightCost: atNight ? pricePerHour * 2 * nightPercent : 0,
      };
      newTimeSlots.times.push(newTime);
    }
    timeSlots.push(newTimeSlots);
    if (i === daysCount) lastSlotAvailable = newDate;
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return { timeSlots, lastSlotAvailable };
};

export { generateSlots };
