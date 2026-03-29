import pg from 'pg';
const { Pool } = pg;
import * as dotenv from 'dotenv';
dotenv.config();

async function checkUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', ['nguyentamduc@gmail.com']);
    console.log('User check results:');
    console.log(JSON.stringify(res.rows, null, 2));
    
    if (res.rows.length > 0) {
      const userId = res.rows[0].id;
      const txRes = await pool.query('SELECT count(*) FROM transactions WHERE user_id = $1', [userId]);
      console.log(`Transactions for user ${userId}:`, txRes.rows[0].count);
    } else {
        console.log("User 'nguyentamduc@gmail.com' not found.");
    }
  } catch (err) {
    console.error('Error checking user:', err);
  } finally {
    await pool.end();
  }
}

checkUser();
