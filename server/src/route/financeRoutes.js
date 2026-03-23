// src/route/financeRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Thư mục lưu hóa đơn tạm thời

const { quickAddTransaction, getSafeToSpend, checkGoalImpact, getDailyStatus, processOCR } = require('../controller/financeController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { quickAddSchema, checkImpactSchema } = require('../util/validationSchemas');

// Áp dụng authMiddleware cho tất cả request chạy qua router này
router.use(authMiddleware);

// Các Endpoints
router.post('/transactions/quick', validate(quickAddSchema), quickAddTransaction);
router.get('/finance/safe-to-spend', getSafeToSpend);
router.post('/finance/check-impact', validate(checkImpactSchema), checkGoalImpact);
router.get('/mascot/status', getDailyStatus);

// API Mới: Upload Hóa Đơn (OCR)
router.post('/finance/ocr', upload.single('billImage'), processOCR);

module.exports = router;