import 'dotenv/config';
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { globalErrorHandler } from "./middleware/error.js";
import authRouter from "./controllers/authController.js";
import financeRouter from "./controllers/financeController.js";

const app = new Hono();

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middlewares
app.use("*", logger());
app.use("*", cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "https://*.vercel.app"],
  credentials: true,
}));

// Global Error Handler
app.onError(globalErrorHandler);

// Serve static files from public directory
app.use("/public/*", serveStatic({ root: "./" }));

// Base Route - Serve HTML landing page with Analytics
app.get("/", (c) => {
  try {
    const htmlPath = join(__dirname, "..", "public", "index.html");
    const html = readFileSync(htmlPath, "utf-8");
    return c.html(html);
  } catch (error) {
    // Fallback to text response if HTML file not found
    return c.text("S2S Finance Tracker API - Enterprise Grade v10 🚀 (Cloud Ready)");
  }
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

// Export cho Vercel (CHỈ ĐÚNG 1 DÒNG NÀY)
export default app;

// For local development (CHỈ ĐÚNG 1 CỤC NÀY)
if (process.env.NODE_ENV !== "production") {
  const { serve } = await import("@hono/node-server");
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
  console.log(`Server is running locally on port ${port}`);
  serve({
    fetch: app.fetch,
    port,
  });
}