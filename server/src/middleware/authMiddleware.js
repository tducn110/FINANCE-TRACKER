// src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// Middleware xác thực JWT thực sự
const authMiddleware = (req, res, next) => {
    // 1. Lấy token từ header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "Truy cập bị từ chối! Vui lòng đăng nhập." });
    }

    // 2. Tách bóc token (Chữ 'Bearer ' chiếm 7 ký tự)
    const token = authHeader.split(' ')[1];

    try {
        // 3. Giải mã JWT (DSA: Thuật toán xác thực đối xứng HMAC SHA256)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Gắn data vào Request để Controller phía sau sử dụng
        req.user = decoded; // Thường chứa { id, username }
        
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn!" });
    }
};

module.exports = authMiddleware;
