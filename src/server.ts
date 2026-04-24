import {initJobs} from "./jobs/index"
import app from "./app";
import mongoose from "mongoose";

const DB_URL = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.cfyrnuj.mongodb.net/`;

mongoose
  .connect(DB_URL)
  .then(() => {
    initJobs();
    console.log("DateBase connected successfully!")
  })
  .catch((err) => console.error("Database connection error:", err));

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} port`);
});

process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err: any) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});