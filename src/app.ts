import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import adminRouter from "./routes/adminRoutes";
import clientRouter from "./routes/clientRoutes";
import categoryRouter from "./routes/categoryRoutes";
import fieldRouter from "./routes/fieldRoutes";
import bookingRouter from "./routes/bookingRoutes";
import statsRouter from "./routes/statsRoutes";
import { globalErrorHandler } from "./controllers/errorController";
import rateLimit from "express-rate-limit";
import sanitizer from "perfect-express-sanitizer";
import helmet from "helmet";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import cors from "cors";
import { AppError } from "./utils/appError";

dotenv.config({ path: "./config.env" });
const app = express();

app.set('trust proxy', 1);

// Enable tokens via cookies to reach here!
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

// 1)- Preventing User to add some headers to requests
app.use(helmet());

// CookieParser Middleware to be able to get tokens that get from frontEnd
app.use(cookieParser());

// 2)- Prevent DOS & BRUTE-FORCE
const limiter = rateLimit({
  limit: 100,
  windowMs: 15 * 60 * 1000,
});
app.use("/api", limiter);

// 3)- Prevent NO-SQL Query INJECTION
app.use(
  sanitizer.clean({
    xss: true,
    noSql: true,
    sql: false,
  }),
);
// 4)- Preventing Parameter Pollution
app.use(
  hpp({
    whitelist: ["duration", "pricePerHour", "capacity", "category"],
  }),
);

// BodyParser and limit the req.body size to prevent DOS
app.use(express.json({ limit: "10kb" }));

// Main Routes
app.use("/api/v1/admins", adminRouter);
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/fields", fieldRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/stats", statsRouter);

// Handle Error when user call non exist endPoint
app.all(/.*/, (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

export default app;