import { Hono } from "hono";
import { financeService } from "../services/financeService.js";
import { authMiddleware } from "../middleware/auth.js";

type Variables = {
  jwtPayload: {
    sub: string;
    email: string;
  };
};

const api = new Hono<{ Variables: Variables }>();

api.use("*", authMiddleware);

api.get("/dashboard", async (c) => {
  const payload = c.get("jwtPayload");
  const data = await financeService.getDashboardData(payload.sub);
  return c.json({ success: true, data });
});

api.get("/safe-to-spend", async (c) => {
  const payload = c.get("jwtPayload");
  const data = await financeService.getSafeToSpend(payload.sub);
  return c.json({ success: true, data });
});

api.get("/mascot-status", async (c) => {
  const payload = c.get("jwtPayload");
  const data = await financeService.getMascotStatus(payload.sub);
  return c.json({ success: true, data });
});

api.get("/categories", async (c) => {
  const data = await financeService.getCategories();
  return c.json({ success: true, data });
});

api.get("/transactions", async (c) => {
  const payload = c.get("jwtPayload");
  const data = await financeService.getTransactions(payload.sub);
  return c.json({ success: true, data });
});

api.post("/transactions/quick", async (c) => {
  const payload = c.get("jwtPayload");
  const body = await c.req.json();
  const data = await financeService.addTransaction(payload.sub, body);
  return c.json({ success: true, data });
});

api.get("/trend", async (c) => {
  const payload = c.get("jwtPayload");
  const data = await financeService.getMonthlyTrend(payload.sub);
  return c.json({ success: true, data });
});

export default api;
