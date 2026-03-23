const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SECURITY } = require('../constant');

const register = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ success: false, message: "Thiếu username hoặc password!" });

        // Check exist
        const exist = await User.findByUsername(username);
        if (exist) return res.status(400).json({ success: false, message: "Tên đăng nhập đã tồn tại!" });

        // Hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create(username, hashedPassword);

        res.status(201).json({ success: true, message: "Đăng ký thành công!" });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ success: false, message: "Thiếu username hoặc password!" });

        const user = await User.findByUsername(username);
        if (!user) return res.status(401).json({ success: false, message: "Sai tên đăng nhập hoặc mật khẩu!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Sai tên đăng nhập hoặc mật khẩu!" });

        // Generate Token
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: SECURITY.TOKEN_EXPIRY });

        res.status(200).json({ success: true, message: "Đăng nhập thành công!", token });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login };
