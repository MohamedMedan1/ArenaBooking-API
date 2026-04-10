import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import { ITimeSlot } from "../interfaces/ITimeSlot";

interface INewTime {
  startTime: string;
  endTime: string;
  duration: number;
  isBooked: boolean;
  atNight: boolean;
  nightCost: number;
}

const generateTimeSlots = (daysCount:number = 7,nightPercent:number = 0.1) =>
    (req:Request,res:Response,next:NextFunction) => {
    if(!req.body.pricePerHour) return next(new AppError("Please provide price per hour for this field",400));
    
    const currentDate = new Date();
    const timeSlots = [];
    
    for(let i = 1; i <= daysCount; i++){
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(0,0,0,0);
        const newDate = new Date(currentDate);
        
        const newTimeSlots:ITimeSlot = {date:newDate,times:[]}
    
        for(let hour = 0; hour < 24; hour += 2){
            const atNight = (hour >=0 && hour <=4) || (hour  >= 18 && hour <= 22); 
            const newTime:INewTime ={
                startTime:`${hour}:00`,
                endTime:`${hour + 2}:00`,
                duration:2,
                isBooked:false,
                atNight,
                nightCost:atNight? (req.body.pricePerHour * 2 * nightPercent):0
            }
            newTimeSlots.times.push(newTime); 
        }
        
        timeSlots.push(newTimeSlots);
    }
    
    req.body.timeSlots = timeSlots;
    next();
}

export { generateTimeSlots };