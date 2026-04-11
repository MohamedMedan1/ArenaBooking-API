import express from "express";
import dotenv from "dotenv";
import adminRouter from "./routes/adminRoutes";
import clientRouter from "./routes/clientRoutes";
import categoryRouter from "./routes/categoryRoutes";
import fieldRouter from "./routes/fieldRoutes";
import bookingRouter from "./routes/bookingRoutes";
import { globalErrorHandler } from "./controllers/errorController";

dotenv.config({ path: "./config.env" });
const app = express();

// Body Parser Middleware
app.use(express.json({ limit: "10kb" }));

// Main Routes
app.use("/api/v1/admins", adminRouter);
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/fields", fieldRouter);
app.use("/api/v1/bookings", bookingRouter);

app.use(globalErrorHandler);

export { app };
