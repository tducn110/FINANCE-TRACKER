// src/constant/index.js
module.exports = {
    CATEGORY: {
        INCOME: 10,
        FOOD: 2,
        DRINK: 3,
        TRANSPORT: 4,
        SAVINGS: 5
    },
    GOAL_STATUS: {
        ACTIVE: 'active',
        COMPLETED: 'completed',
        PAUSED: 'paused'
    },
    SECURITY: {
        TOKEN_EXPIRY: '15m',
        REFRESH_TOKEN_EXPIRY: '7d',
        RATE_LIMIT: {
            WINDOW_MS: 15 * 60 * 1000,
            MAX_REQUESTS: 100
        }
    },
    CACHE_TTL: {
        S2S_ENGINE: 5 * 60 * 1000 // 5 minutes
    },
    MASCOT_ALERT: {
        DANGER_MULTIPLIER: 1.5
    }
};
