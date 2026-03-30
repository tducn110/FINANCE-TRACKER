import { db } from "./src/db/index.js";
import { sql } from "drizzle-orm";

async function check() {
  try {
    console.log("Checking TiDB Cloud Database...");
    const [rows] = await db.execute(sql`SHOW TABLES`);
    console.log("Existing Tables:");
    console.log(JSON.stringify(rows, null, 2));
    
    // Check if tables are empty
    const [userRows]: any = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    console.log(`Users in database: ${userRows[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error checking database:", error);
    process.exit(1);
  }
}

check();
