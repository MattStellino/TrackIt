const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  refreshToken, 
  logout, 
  getProfile, 
  updateProfile, 
  changePassword, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/authController');
const { 
  validateRegister, 
  validateLogin, 
  validateProfileUpdate, 
  validatePasswordChange, 
  handleValidationErrors 
} = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (with rate limiting)
router.post('/register', authLimiter, validateRegister, handleValidationErrors, register);
router.post('/login', authLimiter, validateLogin, handleValidationErrors, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (require authentication)
router.post('/logout', authMiddleware, logout);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, validateProfileUpdate, handleValidationErrors, updateProfile);
router.put('/change-password', authMiddleware, validatePasswordChange, handleValidationErrors, changePassword);

module.exports = router;
