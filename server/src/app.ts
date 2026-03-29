import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import * as dotenv from "dotenv";

import { globalErrorHandler } from "./middleware/error.js";
import authRouter from "./controllers/authController.js";
import financeRouter from "./controllers/financeController.js";

dotenv.config();

const app = new Hono();

// Middlewares
app.use("*", logger());
app.use("*", cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "https://*.vercel.app"],
  credentials: true,
}));

// Global Error Handler
app.onError(globalErrorHandler);

// Base Route
app.get("/", (c) => {
  return c.text("S2S Finance Tracker API - Enterprise Grade v10 🚀 (Cloud Ready)");
});

app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: "TiDB Cloud (MySQL)"
  });
});

// Chắp nối các Router Module
app.route("/api/auth", authRouter);
app.route("/api/finance", financeRouter);

// Export for Vercel
import { handle } from '@hono/node-server/vercel';
export default handle(app);

// For local development
if (process.env.NODE_ENV !== "production") {
  const { serve } = await import("@hono/node-server");
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
  console.log(`Server is running locally on port ${port}`);
  serve({
    fetch: app.fetch,
    port,
  });
}
