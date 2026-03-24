// src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const { SECURITY } = require('../constant');

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
        // Security: Verify issuer to prevent cross-system token replay
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            issuer: SECURITY.JWT_ISSUER
        });
        
        // 4. Gắn data vào Request để Controller phía sau sử dụng
        req.user = decoded; // Chứa { id, username }
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại." });
        }
        return res.status(401).json({ success: false, message: "Token không hợp lệ hoặc đã bị giả mạo!" });
    }
};

module.exports = authMiddleware;
