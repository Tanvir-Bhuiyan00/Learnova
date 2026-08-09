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

const app: Application = express();
app.set("query parser", (str: string) => qs.parse(str));

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent,
);

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

app.use("/api/auth", toNodeHandler(auth));

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
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
}

app.get(
  "/api/v1/cron/cancel-unpaid-enrollments",
  catchAsync(async (req, res) => {
    if (
      req.headers["authorization"] !== `Bearer ${process.env.CRON_SECRET}`
    ) {
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

app.use("/api/v1", IndexRoutes);

app.use(globalErrorHandler);
app.use(notFound);

export default app;
