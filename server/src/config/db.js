const mysql = require('mysql2');
require('dotenv').config();

// Sử dụng Connection Pool để tối ưu hiệu suất (DSA trong DB)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'finance_tracker',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Chuyển sang dạng Promise để dùng async/await cho sạch code
const promisePool = pool.promise();

module.exports = promisePool;