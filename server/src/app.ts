import 'dotenv/config';
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

import { globalErrorHandler } from "./middleware/error.js";
import authRouter from "./controllers/authController.js";
import financeRouter from "./controllers/financeController.js";

type Variables = {
  jwtPayload: {
    sub: string;
    email: string;
  };
};

const app = new Hono<{ Variables: Variables }>();

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
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>S2S Finance Tracker | API Dashboard</title>
      <style>
        body {
          margin: 0;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: #0f172a;
          color: #f8fafc;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 3rem;
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          text-align: center;
          max-width: 500px;
          width: 100%;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        p { color: #94a3b8; font-size: 1.1rem; line-height: 1.6; }
        .status {
          display: inline-flex;
          align-items: center;
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-weight: 600;
          margin: 1.5rem 0;
          font-size: 0.875rem;
        }
        .dot { height: 8px; width: 8px; background: #22c55e; border-radius: 50%; margin-right: 8px; }
        .links {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 2rem;
        }
        .btn {
          background: #334155;
          color: white;
          text-decoration: none;
          padding: 0.75rem;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          transition: 0.2s;
        }
        .btn:hover { background: #475569; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>S2S Finance Tracker</h1>
        <p>Enterprise Grade Financial Monitoring System</p>
        <div class="status"><span class="dot"></span> API RUNNING SUCCESS - VERCEL LIVE 🚀</div>
        <div class="links">
          <a href="/health" class="btn">System Health</a>
          <a href="/api/finance/stats" class="btn">Finance Stats</a>
          <a href="/api/auth/profile" class="btn">Auth Profile</a>
          <a href="https://github.com/tducn110/FINANCE-TRACKER" class="btn" target="_blank">Documentation</a>
        </div>
      </div>
    </body>
    </html>
  `);
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
