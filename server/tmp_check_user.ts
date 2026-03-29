import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', ['nguyentamduc@gmail.com']);
    console.log('User check results:', JSON.stringify(res.rows, null, 2));
    
    // Also check total users
    const countRes = await pool.query('SELECT count(*) FROM users');
    console.log('Total users in DB:', countRes.rows[0].count);
    
    // Check transactions for this user
    if (res.rows.length > 0) {
      const userId = res.rows[0].id;
      const txRes = await pool.query('SELECT count(*) FROM transactions WHERE user_id = $1', [userId]);
      console.log(`Transactions for user ${userId}:`, txRes.rows[0].count);
    }
  } catch (err) {
    console.error('Error checking user:', err);
  } finally {
    await pool.end();
  }
}

checkUser();
