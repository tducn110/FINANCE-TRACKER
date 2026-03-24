const User = require('../model/User');
const UserSettings = require('../model/UserSettings');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SECURITY } = require('../constant');

/**
 * POST /api/auth/register
 * Creates a new user account + default user_settings row.
 */
const register = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Thiếu username hoặc password!", data: null });
        }

        // Check if username already exists
        const exist = await User.findByUsername(username);
        if (exist) {
            return res.status(409).json({ success: false, message: "Tên đăng nhập đã tồn tại!", data: null });
        }

        // Hash password with bcrypt (10 salt rounds)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userId = await User.create(username, hashedPassword);

        // Auto-create default user_settings so S2S engine works immediately
        await UserSettings.createDefault(userId);

        res.status(201).json({
            success: true,
            message: "Đăng ký thành công!",
            data: { userId }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/login
 * Verifies credentials and returns a JWT token.
 * Security: Generic error message to prevent username enumeration (OWASP).
 */
const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Thiếu username hoặc password!", data: null });
        }

        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ success: false, message: "Sai tên đăng nhập hoặc mật khẩu!", data: null });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Sai tên đăng nhập hoặc mật khẩu!", data: null });
        }

        // Sign JWT with issuer claim to prevent cross-system token misuse
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: SECURITY.TOKEN_EXPIRY, issuer: SECURITY.JWT_ISSUER }
        );

        res.status(200).json({
            success: true,
            message: "Đăng nhập thành công!",
            data: { token }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login };
