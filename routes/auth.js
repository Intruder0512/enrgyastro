const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');

router.get('/register', authController.showRegister);
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('phone').trim().isLength({ min: 10 }).withMessage('A valid phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  asyncHandler(authController.register)
);

router.get('/login', authController.showLogin);
router.post('/login', asyncHandler(authController.login));

router.get('/logout', authController.logout);

module.exports = router;
