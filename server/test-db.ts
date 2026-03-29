import { db } from "./src/db/index.js";
import { users } from "./src/db/schema.js";

async function test() {
  try {
    const res = await db.select().from(users).limit(1);
    console.log("DB Connection OK. Found users:", res.length);
    process.exit(0);
  } catch (err) {
    console.error("DB Connection FAILED:", err);
    process.exit(1);
  }
}

test();
