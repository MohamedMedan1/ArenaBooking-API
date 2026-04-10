import {initJobs} from "./jobs/index"
import { app } from "./app";
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
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} port`);
});
