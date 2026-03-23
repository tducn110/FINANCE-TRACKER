const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config(); // Load biến môi trường từ file .env
const { SECURITY } = require('./constant');
const financeRoutes = require('./route/financeRoutes');
const authRoutes = require('./route/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 🛡️ Security: Bật HTTP Headers bảo mật cực mạnh chống XSS
app.use(helmet());

// 🛡️ Security: Bật CORS cho phép Frontend gọi API
app.use(cors());

// 🛡️ Security: Rate Limiting (Chống Spam API làm sập DB)
const limiter = rateLimit({
    windowMs: SECURITY.RATE_LIMIT.WINDOW_MS, 
    max: SECURITY.RATE_LIMIT.MAX_REQUESTS, 
    message: { success: false, message: "Bạn thao tác quá nhanh, vui lòng chờ chút nhé!" }
});
app.use('/api', limiter);

// Middleware quan trọng: Giúp Express đọc được data JSON từ Frontend gửi lên
app.use(express.json());

// Cắm các Route vào App
app.use('/api/auth', authRoutes); // Auth Route không bị vướng Middleware chặn
app.use('/api', financeRoutes);   // Finance Route bị chặn bởi Middleware tại file route

// Global Error Handler (Bắt mọi lỗi 500)
app.use((err, req, res, next) => {
    console.error("🔥 Lỗi Hệ Thống:", err.stack);
    
    // Gợi ý cho báo cáo: "Chỗ này đã sẵn sàng để gắn Sentry tracking"
    res.status(500).json({
        success: false,
        message: "Lỗi Server nội bộ! Đội ngũ dev đang xử lý.",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Kích hoạt Server
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Trạm không gian đang bay tại Cổng: ${PORT}`);
    console.log(`🔗 API Endpoint: http://localhost:${PORT}/api/transactions/quick`);
    console.log(`=========================================`);
});