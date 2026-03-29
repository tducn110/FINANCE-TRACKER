import { Hono } from "hono";
import { generateToken, setAuthCookie, clearAuthCookie } from "../middleware/auth.js";

const api = new Hono();

api.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  // Simulated validation for Alpha Test
  if (email === "demo@s2s.vn" && password === "123456") {
    const token = await generateToken("demo-user-id", email);
    setAuthCookie(c, token);
    return c.json({ success: true, user: { id: "demo-user-id", fullName: "Demo User", email } });
  }
  return c.json({ success: false, message: "Invalid credentials" }, 401);
});

api.post("/logout", (c) => {
  clearAuthCookie(c);
  return c.json({ success: true });
});

export default api;
