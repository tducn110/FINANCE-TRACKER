import 'dotenv/config';
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { globalErrorHandler } from "./middleware/error.js";
import authRouter from "./controllers/authController.js";
import financeRouter from "./controllers/financeController.js";

type Variables = {
  jwtPayload: {
    sub: string;
    email: string;
  };
};

export const app = new Hono<{ Variables: Variables }>();

// Middlewares
app.use("*", logger());
app.use("*", cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "https://*.vercel.app"],
  credentials: true,
}));

// Global Error Handler
app.onError(globalErrorHandler);

// Base Route - Serve HTML landing page với Analytics
app.get("/", (c) => {
  try {
    const htmlPath = join(__dirname, "..", "public", "index.html");
    const html = readFileSync(htmlPath, "utf-8");
    return c.html(html);
  } catch (error) {
    // Chỉ fallback về text nếu không tìm thấy file HTML
    console.error("Lỗi đọc file landing page:", error);
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

// Export for Vercel/Others
export default app;

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
