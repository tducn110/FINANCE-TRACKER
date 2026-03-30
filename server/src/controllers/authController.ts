import { Hono } from "hono";
import { generateToken, setAuthCookie, clearAuthCookie } from "../middleware/auth.js";

const api = new Hono();

api.post("/login", async (c) => {
  const body = await c.req.json();
  const { email, password } = body;
  
  console.log(`[AUTH] Login attempt for: ${email}`);

  // Simulated validation for Alpha Test
  if (email === "demo@s2s.vn" && password === "123456") {
    console.log(`[AUTH] Login SUCCESS for: ${email}`);
    const token = await generateToken("demo-user-id", email);
    setAuthCookie(c, token);
    return c.json({ 
      success: true, 
      data: {
        token: token,
        user: { id: "demo-user-id", fullName: "Demo User", email }
      }
    });
  }
  
  console.warn(`[AUTH] Login FAILED for: ${email} - Invalid credentials`);
  return c.json({ success: false, message: "Invalid credentials" }, 401);
});

api.post("/register", async (c) => {
  const { email, fullName } = await c.req.json();
  const token = await generateToken("demo-user-id", email);
  setAuthCookie(c, token);
  return c.json({ 
    success: true, 
    data: {
      token: token,
      user: { id: "demo-user-id", fullName: fullName || "New User", email }
    }
  });
});

api.post("/logout", (c) => {
  clearAuthCookie(c);
  return c.json({ success: true });
});

export default api;
