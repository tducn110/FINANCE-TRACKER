import { sign, verify } from "hono/jwt";
import type { Context, Next } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("CRITICAL: JWT_SECRET environment variable is not defined.");
}

// Simulated Redis Blacklist
export const tokenBlacklist = new Set<string>();

export const generateToken = async (userId: string, email: string) => {
  const payload = {
    sub: userId,
    email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  };
  return await sign(payload, JWT_SECRET);
};

export const setAuthCookie = (c: Context, token: string) => {
  setCookie(c, "auth_token", token, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "Strict",
    maxAge: 60 * 60 * 24 * 7,
  });
};

export const clearAuthCookie = (c: Context) => {
  deleteCookie(c, "auth_token");
};

export const authMiddleware = async (c: Context, next: Next) => {
  const token = getCookie(c, "auth_token") || c.req.header("Authorization")?.replace("Bearer ", "");

  if (!token || tokenBlacklist.has(token)) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }

  try {
    const decodedPayload = await verify(token, JWT_SECRET, "HS256");
    c.set("jwtPayload", decodedPayload);
    await next();
  } catch (error) {
    return c.json({ success: false, message: "Invalid Token" }, 401);
  }
};
