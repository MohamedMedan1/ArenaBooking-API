import express from "express";
import dotenv from "dotenv";
import adminRouter from "./routes/adminRoutes";
import clientRouter from "./routes/clientRoutes";

dotenv.config({ path: './config.env' });
const app = express();

// Body Parser Middleware
app.use(express.json({ limit: "10kb" }));

// Main Routes
app.use("/api/v1/admins",adminRouter);
app.use("/api/v1/clients",clientRouter);

export { app };