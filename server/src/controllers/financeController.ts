import { Hono } from "hono";
import { financeService } from "../services/financeService.js";
import { authMiddleware } from "../middleware/auth.js";

const api = new Hono();

api.use("*", authMiddleware);

api.get("/dashboard", async (c) => {
  const payload = c.get("jwtPayload");
  const data = await financeService.getDashboardData(payload.sub);
  return c.json({ success: true, data });
});

api.get("/trend", async (c) => {
  const payload = c.get("jwtPayload");
  const data = await financeService.getMonthlyTrend(payload.sub);
  return c.json({ success: true, data });
});

export default api;
