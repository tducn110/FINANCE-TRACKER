const Transaction = require('../model/Transaction');
const FixedCost = require('../model/FixedCost');
const Goal = require('../model/Goal');
const UserSettings = require('../model/UserSettings');
const FinanceService = require('../service/FinanceService'); // OOP Feature: Business Logic
const { parseQuickInput } = require('../util/regexHelper');
const { CATEGORY, MASCOT_ALERT } = require('../constant');

const quickAddTransaction = async (req, res, next) => {
    try {
        const { rawInput } = req.body;
        if (!rawInput) return res.status(400).json({ success: false, message: "Vui lòng nhập dữ liệu!" });

        const parsedData = parseQuickInput(rawInput);
        if (!parsedData) return res.status(400).json({ success: false, message: "Sai định dạng. Thử: '50k cafe'" });

        // Dùng Auth Middleware (bỏ fix cứng ID)
        const userId = req.user.id;
        let categoryId = CATEGORY.SAVINGS; 

        const noteLower = parsedData.note.toLowerCase();
        if (noteLower.includes('ăn') || noteLower.includes('cơm') || noteLower.includes('phở')) {
            categoryId = CATEGORY.FOOD; 
        } else if (noteLower.includes('cafe') || noteLower.includes('nước') || noteLower.includes('trà')) {
            categoryId = CATEGORY.DRINK; 
        } else if (noteLower.includes('xe') || noteLower.includes('xăng')) {
            categoryId = CATEGORY.TRANSPORT; 
        }

        // Áp dụng ACID Transaction thay vì insert chay
        const insertId = await Transaction.quickCreateWithTransaction(parsedData.amount, parsedData.note, categoryId, userId);

        // DSA: Khi có giao dịch mới, invalidate Cache của S2S ngay
        FinanceService.invalidateCache(userId);

        res.status(201).json({
            success: true,
            message: "Đã ghi sổ thành công! 🚀",
            data: { id: insertId, ...parsedData }
        });

    } catch (error) {
        next(error); // Chuyển lỗi cho Global Error Handler trong app.js
    }
};

// 🧠 API TÍNH TOÁN SAFE-TO-SPEND (S2S ENGINE)
const getSafeToSpend = async (req, res, next) => {
    try {
        // OOP: Gọi thẳng vào Service Layer, code Controller cực kì mỏng gọn
        const s2sData = await FinanceService.calculateS2S(req.user.id);

        res.status(200).json({
            success: true,
            data: s2sData
        });
    } catch (error) {
        next(error);
    }
};

// 🔮 API: CHECK GOAL IMPACT (Mù mờ tương lai)
const checkGoalImpact = async (req, res, next) => {
    try {
        const { expenseAmount } = req.body; 
        const userId = req.user.id;

        if (!expenseAmount) return res.status(400).json({ success: false, message: "Thiếu số tiền cần check!" });

        // Sử dụng chuẩn OOP: Gọi hàm từ Model thay vì viết thẳng SQL vào Controller
        const goal = await Goal.getTopActiveGoal(userId);
        if (!goal) return res.status(200).json({ success: true, message: "Không có mục tiêu nào bị ảnh hưởng." });

        const dailySavingRate = goal.monthly_contribution / 30; 
        const delayedDays = Math.ceil(expenseAmount / dailySavingRate);

        res.status(200).json({
            success: true,
            data: {
                goalName: goal.name,
                expenseAmount: Number(expenseAmount),
                delayedDays: delayedDays,
                message: `Cảnh báo: Khoản chi này sẽ làm mục tiêu '${goal.name}' của bạn chậm lại ${delayedDays} ngày đấy!`
            }
        });

    } catch (error) {
        next(error);
    }
};

// 🐼 API: DAILY LIMIT & MASCOT STATUS
const getDailyStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Gọi logic thật từ Service để lấy giá trị S2S thay vì mock
        const s2sData = await FinanceService.calculateS2S(userId);
        const currentS2S = s2sData.safeToSpend;
        
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const daysLeft = daysInMonth - today.getDate() + 1;

        const dailyLimit = Math.round(currentS2S / daysLeft);

        // OOP: Dùng hàm của Model thay vì query trực tiếp
        const spentToday = await Transaction.getTodayExpense(userId);

        let mascotEmotion = 'HAPPY'; 
        let alertMessage = "Tốt lắm! Bạn đang kiểm soát rất tốt.";

        if (spentToday > dailyLimit * MASCOT_ALERT.DANGER_MULTIPLIER) {
            mascotEmotion = 'CRYING';
            alertMessage = "Báo động đỏ! Bạn đã tiêu vượt ranh giới an toàn quá nhiều!";
        } else if (spentToday > dailyLimit) {
            mascotEmotion = 'ANXIOUS';
            alertMessage = "Cẩn thận! Bạn đã chạm ngưỡng Pickball Alert của hôm nay.";
        }

        res.status(200).json({
            success: true,
            data: {
                s2sRemaining: currentS2S,
                daysLeft: daysLeft,
                dailyLimit: dailyLimit,
                spentToday: Number(spentToday),
                mascotEmotion: mascotEmotion,
                alertMessage: alertMessage
            }
        });

    } catch (error) {
        next(error);
    }
};

// 👁️ API OCR: Quét ảnh hóa đơn lấy số tiền (Giải quyết Input Friction)
const processOCR = async (req, res, next) => {
    try {
        const Tesseract = require('tesseract.js');
        const fs = require('fs');

        if (!req.file) return res.status(400).json({ success: false, message: "Vui lòng tải lên ảnh hóa đơn!" });

        const imagePath = req.file.path;

        // Dùng Tesseract đọc chữ trong ảnh (Nhận diện tiếng Việt + Anh)
        const { data: { text } } = await Tesseract.recognize(imagePath, 'vie+eng');

        // Regex tìm số tiền (VD: 50.000, 50,000, 50k, 50.000đ)
        const moneyRegex = /([\d,.]+)\s*(?:VND|đ|VNĐ|k|K)/gi;
        const matches = text.match(moneyRegex);

        let suggestedAmount = 0;
        if (matches && matches.length > 0) {
            // Lấy con số cuối cùng (thường hóa đơn Tổng tiền nằm ở cuối)
            let rawAmount = matches[matches.length - 1]; 
            suggestedAmount = parseInt(rawAmount.replace(/[,.]/g, ''), 10);
            if (rawAmount.toLowerCase().includes('k')) {
                 suggestedAmount *= 1000;
            }
        }

        // Chống lấp đầy ổ cứng: Xóa file ảnh sau khi giải mã xong
        fs.unlinkSync(imagePath);

        res.status(200).json({
            success: true,
            data: {
                suggestedAmount,
                fullText: text, // Trả về text gốc để Frontend hiển thị cho user tự sửa nếu Tesseract nhìn nhầm
                message: "Đã bóc tách hóa đơn. Vui lòng kiểm tra lại số tiền trước khi lưu!"
            }
        });

    } catch (error) {
        // Nếu lỗi xảy ra, cố gắng xóa file ảnh tránh rác
        if (req.file && req.file.path) {
            const fs = require('fs');
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

module.exports = { quickAddTransaction, getSafeToSpend, checkGoalImpact, getDailyStatus, processOCR };