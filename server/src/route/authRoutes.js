const express = require('express');
const router = express.Router();
const { register, login } = require('../controller/authController');
const validate = require('../middleware/validateMiddleware');
const { authSchema } = require('../util/validationSchemas');

router.post('/register', validate(authSchema), register);
router.post('/login', validate(authSchema), login);

module.exports = router;
