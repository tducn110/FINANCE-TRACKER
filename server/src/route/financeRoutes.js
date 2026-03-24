// src/route/financeRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { UPLOAD } = require('../constant');

// Security: Multer with file type filter + size limit
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: UPLOAD.MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        if (UPLOAD.ALLOWED_MIMETYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh (JPG, PNG, WebP)!'), false);
        }
    }
});

const { quickAddTransaction, getSafeToSpend, checkGoalImpact, getDailyStatus, processOCR, getCategories } = require('../controller/financeController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { quickAddSchema, checkImpactSchema } = require('../util/validationSchemas');

// Public route: Category templates (no auth needed for FE picker)
router.get('/categories', getCategories);

// Protected routes: Require JWT authentication
router.use(authMiddleware);

router.post('/transactions/quick', validate(quickAddSchema), quickAddTransaction);
router.get('/finance/safe-to-spend', getSafeToSpend);
router.post('/finance/check-impact', validate(checkImpactSchema), checkGoalImpact);
router.get('/mascot/status', getDailyStatus);

// OCR upload with security filter
router.post('/finance/ocr', upload.single('billImage'), processOCR);

module.exports = router;