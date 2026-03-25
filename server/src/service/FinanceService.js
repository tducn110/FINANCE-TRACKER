const Transaction = require('../model/Transaction');
const FixedCost = require('../model/FixedCost');
const Goal = require('../model/Goal');
const UserSettings = require('../model/UserSettings');
const { CACHE_TTL } = require('../constant');

/**
 * OOP: Business Logic Layer (Fat Service, Skinny Controller).
 * DSA: CacheAdapter wrapping ES6 Map for O(1) S2S lookups.
 * Scalability: CacheAdapter interface allows future Redis swap with zero Controller changes.
 * 
 * The S2S Engine is the "brain" of this application.
 * Formula: S2S = MonthlyIncome - MonthlyExpense - UnpaidBills - GoalCommitments - EmergencyBuffer
 */
/**
 * CacheAdapter: Strategy Pattern wrapper around Map().
 * All methods are async to allow future Redis/Memcached swap.
 */
class CacheAdapter {
    constructor() {
        this.store = new Map();
    }

    async get(key) {
        const cached = this.store.get(key);
        if (!cached) return null;
        if (Date.now() - cached.timestamp > cached.ttl) {
            this.store.delete(key);
            return null;
        }
        return cached.value;
    }

    async set(key, value, ttl) {
        this.store.set(key, { value, timestamp: Date.now(), ttl });
    }

    async delete(key) {
        this.store.delete(key);
    }
}

class FinanceService {
    constructor() {
        this.cache = new CacheAdapter();
    }

    /**
     * Calculate Safe-to-Spend for a given user.
     * All values are scoped to the CURRENT MONTH.
     * 
     * Deadlock analysis: This method is READ-ONLY (no transactions).
     * Potential issue: "Read Skew" if data changes between queries.
     * Mitigation: Acceptable for dashboard display; ACID only needed for writes.
     */
    async calculateS2S(userId) {
        // CacheAdapter: O(1) async check before hitting the database
        const cachedResult = await this.cache.get(userId);
        if (cachedResult) {
            console.log("⚡ [Cache Hit] Returning S2S from CacheAdapter");
            return cachedResult;
        }

        // Auto-detect overdue bills before calculating
        await FixedCost.markOverdue(userId);

        // Query all components from Models (each scoped to current month)
        const totalIncome = await Transaction.getTotalIncome(userId);
        const totalExpense = await Transaction.getTotalExpense(userId);
        const actualBalance = Number(totalIncome) - Number(totalExpense);

        const unpaidBills = Number(await FixedCost.getUnpaidBills(userId));
        const goalCommitments = Number(await Goal.getMonthlyCommitments(userId));

        const settings = await UserSettings.findByUserId(userId);
        const buffer = settings ? Number(settings.emergency_buffer) : 0;

        const safeToSpend = actualBalance - unpaidBills - goalCommitments - buffer;

        const result = {
            totalIncome: Number(totalIncome),
            totalExpense: Number(totalExpense),
            actualBalance,
            unpaidBills,
            goalCommitments,
            emergencyBuffer: buffer,
            safeToSpend,
            isOverBudget: safeToSpend < 0
        };

        // Cache result for future O(1) reads
        await this.cache.set(userId, result, CACHE_TTL.S2S_ENGINE);
        return result;
    }

    /**
     * Invalidate cache when user performs a financial action.
     * Forces recalculation on next S2S request.
     */
    async invalidateCache(userId) {
        await this.cache.delete(userId);
    }
}

// Export as Singleton (one shared instance across all requests)
module.exports = new FinanceService();
