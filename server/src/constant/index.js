// src/constant/index.js
// Central source of truth for all magic numbers and config values.
// Category IDs MUST match the database seed in database.sql.

module.exports = {
    CATEGORY: {
        INCOME: 1,
        FOOD: 2,
        DRINK: 3,
        TRANSPORT: 4,
        RENT: 5,
        SAVINGS: 6,
        OTHER: 7
    },
    GOAL_STATUS: {
        ACTIVE: 'active',
        COMPLETED: 'completed',
        PAUSED: 'paused'
    },
    FIXED_COST_STATUS: {
        PENDING: 'PENDING',
        PAID: 'PAID',
        OVERDUE: 'OVERDUE'
    },
    SECURITY: {
        TOKEN_EXPIRY: '15m',
        REFRESH_TOKEN_EXPIRY: '7d',
        JWT_ISSUER: 's2s-finance',
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
    },
    UPLOAD: {
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_MIMETYPES: ['image/jpeg', 'image/png', 'image/webp']
    },
    SOFT_DELETE: {
        RETENTION_DAYS: 30
    }
};
