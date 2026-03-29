import type { Context } from "hono";

export const globalErrorHandler = (err: any, c: Context) => {
  console.error(err);
  const status = err.status || 500;
  return c.json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  }, status);
};
