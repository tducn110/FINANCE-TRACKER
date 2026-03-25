const Transaction = require('../model/Transaction');
const Goal = require('../model/Goal');
const FinanceService = require('../service/FinanceService');
const { parseQuickInput } = require('../util/regexHelper');
const { CATEGORY, MASCOT_ALERT } = require('../constant');
const db = require('../config/db');

/**
 * POST /api/transactions/quick
 * Quick-Add: Parse natural language input ("50k cafe" OR "cafe 50k") and create a transaction.
 */
const quickAddTransaction = async (req, res, next) => {
    try {
        const { rawInput } = req.body;
        if (!rawInput) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập dữ liệu!", data: null });
        }

        const parsedData = parseQuickInput(rawInput);
        if (!parsedData) {
            return res.status(400).json({ success: false, message: "Sai định dạng. Thử: '50k cafe' hoặc 'cafe 50k'", data: null });
        }

        const userId = req.user.id;

        // Auto-categorize based on keywords in the note
        let categoryId = CATEGORY.OTHER; // Default: uncategorized expense
        const noteLower = parsedData.note.toLowerCase();

        if (noteLower.includes('lương') || noteLower.includes('income') || noteLower.includes('thu nhập')) {
            categoryId = CATEGORY.INCOME;
        } else if (noteLower.includes('ăn') || noteLower.includes('cơm') || noteLower.includes('phở') || noteLower.includes('bún')) {
            categoryId = CATEGORY.FOOD;
        } else if (noteLower.includes('cafe') || noteLower.includes('nước') || noteLower.includes('trà') || noteLower.includes('bia')) {
            categoryId = CATEGORY.DRINK;
        } else if (noteLower.includes('xe') || noteLower.includes('xăng') || noteLower.includes('grab') || noteLower.includes('taxi')) {
            categoryId = CATEGORY.TRANSPORT;
        }

        // ACID Transaction insert
        const insertId = await Transaction.create(parsedData.amount, parsedData.note, categoryId, userId);

        // Invalidate S2S cache so next read recalculates
        await FinanceService.invalidateCache(userId);

        res.status(201).json({
            success: true,
            message: "Đã ghi sổ thành công! ",
            data: { id: insertId, ...parsedData, categoryId }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/finance/safe-to-spend
 * Returns the S2S calculation for the authenticated user.
 */
const getSafeToSpend = async (req, res, next) => {
    try {
        const s2sData = await FinanceService.calculateS2S(req.user.id);

        res.status(200).json({
            success: true,
            message: "S2S calculated successfully.",
            data: s2sData
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/finance/check-impact
 * Calculates how many days a potential expense would delay the user's top goal.
 */
const checkGoalImpact = async (req, res, next) => {
    try {
        const { expenseAmount } = req.body;
        const userId = req.user.id;

        if (!expenseAmount) {
            return res.status(400).json({ success: false, message: "Thiếu số tiền cần check!", data: null });
        }

        const goal = await Goal.getTopActiveGoal(userId);
        if (!goal) {
            return res.status(200).json({
                success: true,
                message: "Không có mục tiêu nào đang hoạt động.",
                data: { goalName: null, delayedDays: 0 }
            });
        }

        const dailySavingRate = goal.monthly_contribution / 30;
        const delayedDays = dailySavingRate > 0 ? Math.ceil(expenseAmount / dailySavingRate) : 0;

        res.status(200).json({
            success: true,
            message: `Khoản chi này sẽ làm mục tiêu '${goal.name}' chậm lại ${delayedDays} ngày.`,
            data: {
                goalName: goal.name,
                expenseAmount: Number(expenseAmount),
                delayedDays
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/mascot/status
 * Returns daily spending limit, today's total, and mascot emotion.
 */
const getDailyStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const s2sData = await FinanceService.calculateS2S(userId);
        const currentS2S = s2sData.safeToSpend;

        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        // Guard against division by zero on the last day of the month
        const daysLeft = Math.max(daysInMonth - today.getDate() + 1, 1);

        // Daily budget = remaining S2S / days left (can be negative if overspent)
        const dailyLimit = Math.round(currentS2S / daysLeft);

        const spentToday = Number(await Transaction.getTodayExpense(userId));

        let mascotEmotion = 'HAPPY';
        let alertMessage = "Tốt lắm! Bạn đang kiểm soát rất tốt. 🎉";

        if (s2sData.isOverBudget) {
            mascotEmotion = 'CRYING';
            alertMessage = "🚨 Báo động! Bạn đã tiêu vượt quá ngân sách tháng này!";
        } else if (spentToday > dailyLimit * MASCOT_ALERT.DANGER_MULTIPLIER) {
            mascotEmotion = 'CRYING';
            alertMessage = "😢 Báo động đỏ! Bạn đã tiêu vượt ranh giới an toàn quá nhiều!";
        } else if (spentToday > dailyLimit) {
            mascotEmotion = 'ANXIOUS';
            alertMessage = "😰 Cẩn thận! Bạn đã chạm ngưỡng Pickball Alert hôm nay.";
        }

        res.status(200).json({
            success: true,
            message: alertMessage,
            data: {
                s2sRemaining: currentS2S,
                isOverBudget: s2sData.isOverBudget,
                daysLeft,
                dailyLimit,
                spentToday,
                mascotEmotion,
                alertMessage
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/finance/ocr
 * Upload a bill image → Tesseract OCR extracts the amount.
 * FIX: Safe cleanup with try-catch to prevent race condition crash.
 */
const Tesseract = require('tesseract.js');
const fs = require('fs');

const processOCR = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Vui lòng tải lên ảnh hóa đơn!", data: null });
        }

        const imagePath = req.file.path;

        const { data: { text } } = await Tesseract.recognize(imagePath, 'vie+eng');

        // Regex: Match Vietnamese currency patterns (50.000, 50,000, 50k, 50.000đ)
        const moneyRegex = /([\d,.]+)\s*(?:VND|đ|VNĐ|k|K)/gi;
        const matches = text.match(moneyRegex);

        let suggestedAmount = 0;
        if (matches && matches.length > 0) {
            let rawAmount = matches[matches.length - 1];
            suggestedAmount = parseInt(rawAmount.replace(/[,.]/g, ''), 10);
            if (rawAmount.toLowerCase().includes('k')) {
                suggestedAmount *= 1000;
            }
        }

        // Safe cleanup: Prevent crash if file already deleted by another request
        _safeUnlink(imagePath);

        res.status(200).json({
            success: true,
            message: "Đã bóc tách hóa đơn. Vui lòng kiểm tra lại số tiền trước khi lưu!",
            data: {
                suggestedAmount,
                fullText: text
            }
        });

    } catch (error) {
        // Safe cleanup on error
        if (req.file && req.file.path) _safeUnlink(req.file.path);
        next(error);
    }
};

/**
 * Safe file deletion helper.
 * Prevents crash from race condition when 2 requests try to delete same file.
 */
function _safeUnlink(filePath) {
    try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (_) {
        // File already deleted by another process — safe to ignore
    }
}

/**
 * GET /api/categories
 * Returns all available categories as preset templates for Frontend picker.
 */
const getCategories = async (req, res, next) => {
    try {
        const [rows] = await db.execute('SELECT id, name, type, icon FROM categories ORDER BY id');
        res.status(200).json({
            success: true,
            message: "Danh sách danh mục.",
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { quickAddTransaction, getSafeToSpend, checkGoalImpact, getDailyStatus, processOCR, getCategories };