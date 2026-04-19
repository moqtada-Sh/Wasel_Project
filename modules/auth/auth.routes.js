const express = require('express');
const router = express.Router();
const controller = require('./auth.controller');
const validate = require('../../middleware/validation.middleware');

const {
    registerSchema,
    loginSchema,
    refreshSchema
} = require('./auth.validation');

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshSchema), controller.refresh);

module.exports = router;