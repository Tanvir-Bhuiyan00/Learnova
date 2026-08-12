import express, { Application } from "express";
import { IndexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { envVars } from "./app/config/env";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import qs from "qs";
import cron from "node-cron";
import { PaymentController } from "./app/module/payment/payment.controller";
import { EnrollmentService } from "./app/module/enrollment/enrollment.service";
import { catchAsync } from "./app/shared/catchAsync";
import { sendResponse } from "./app/shared/sendResponse";
import { rateLimit, sweepRateLimitBuckets } from "./app/middleware/rateLimit";
import { compress } from "./app/middleware/compress";

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  keyPrefix: "rl:auth",
  message: "Too many authentication attempts, please try again later.",
});

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  keyPrefix: "rl:api",
});

const app: Application = express();
app.set("query parser", (str: string) => qs.parse(str));

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent,
);

// Compress JSON/text responses. Mounted after the raw webhook route so
// Stripe signature verification always sees the unmodified body.
app.use(compress());

app.use(
  cors({
    origin: [
      envVars.FRONTEND_URL,
      envVars.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/auth", authRateLimiter, toNodeHandler(auth));

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

cron.schedule("*/25 * * * *", async () => {
  try {
    console.log("Running cron job to cancel unpaid enrollments...");
    await EnrollmentService.cancelUnpaidEnrollments();
  } catch (error: any) {
    console.error(
      "Error occurred while canceling unpaid enrollments:",
      error.message,
    );
  }
});

cron.schedule("* * * * *", () => {
  sweepRateLimitBuckets();
});

app.get(
  "/api/v1/cron/cancel-unpaid-enrollments",
  catchAsync(async (req, res) => {
    if (req.headers["authorization"] !== `Bearer ${envVars.CRON_SECRET}`) {
      return sendResponse(res, {
        success: false,
        httpStatusCode: 401,
        message: "Unauthorized",
      });
    }
    await EnrollmentService.cancelUnpaidEnrollments();
    sendResponse(res, {
      success: true,
      httpStatusCode: 200,
      message: "Cron job executed",
    });
  }),
);

app.use("/api/v1", apiRateLimiter, IndexRoutes);

app.use(globalErrorHandler);
app.use(notFound);

export default app;
