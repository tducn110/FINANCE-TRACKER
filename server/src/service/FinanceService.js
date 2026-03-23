// src/service/FinanceEngine.js
const Transaction = require('../model/Transaction');
const FixedCost = require('../model/FixedCost');
const Goal = require('../model/Goal');
const UserSettings = require('../model/UserSettings');
const { CACHE_TTL } = require('../constant');

// OOP: Lớp xử lý nghiệp vụ lõi (Business Logic Layer)
// DSA: Ứng dụng Hash Map để làm In-memory Cache, giảm tải Database Query (Time Complexity: O(1))
class FinanceService {
    constructor() {
        // Khởi tạo bộ nhớ tạm để làm Cache (DSA: Hash Map)
        this.s2sCache = new Map();
    }

    async calculateS2S(userId) {
        // DSA: Kiểm tra Cache trước, nếu còn hạn thì ném ra lấy luôn (O(1))
        if (this.s2sCache.has(userId)) {
            const cachedData = this.s2sCache.get(userId);
            if (Date.now() - cachedData.timestamp < CACHE_TTL.S2S_ENGINE) {
                console.log("⚡ [Cache Hit] Trả về S2S từ Hash Map!");
                return cachedData.value;
            }
        }

        // OOP: Tính toán dựa trên methods của các Models (Encapsulation)
        // Tính toán số dư thực tế
        const totalIncome = await Transaction.getTotalIncome(userId);
        const totalExpense = await Transaction.getTotalExpense(userId);
        const actualBalance = totalIncome - totalExpense;

        const unpaidBills = await FixedCost.getUnpaidBills(userId);
        const goalCommitments = await Goal.getMonthlyCommitments(userId);
        
        const settings = await UserSettings.findByUserId(userId);
        const buffer = settings ? settings.emergency_buffer : 0;

        const safeToSpend = actualBalance - unpaidBills - goalCommitments - buffer;

        const result = {
            actualBalance: Number(actualBalance),
            unpaidBills: Number(unpaidBills),
            goalCommitments: Number(goalCommitments),
            emergencyBuffer: Number(buffer),
            safeToSpend: Number(safeToSpend)
        };

        // Cache lại kết quả
        this.s2sCache.set(userId, { value: result, timestamp: Date.now() });

        return result;
    }

    // Xóa cache khi user thực hiện giao dịch (để ép tính lại vào lần gọi sau)
    invalidateCache(userId) {
        this.s2sCache.delete(userId);
    }
}

// Export Singleton
module.exports = new FinanceService();
