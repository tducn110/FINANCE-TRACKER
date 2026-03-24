const mysql = require('mysql2');
require('dotenv').config();

// Validate required environment variables at startup
const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const key of requiredEnv) {
    if (!process.env[key]) {
        console.error(`❌ FATAL: Missing environment variable "${key}" in .env file.`);
        process.exit(1);
    }
}

// Connection Pool for optimal performance (reuses connections instead of open/close)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export as Promise wrapper for async/await syntax
const promisePool = pool.promise();
module.exports = promisePool;