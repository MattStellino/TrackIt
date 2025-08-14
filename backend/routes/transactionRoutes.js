const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
  getTransactionCategories,
  bulkDeleteTransactions
} = require('../controllers/transactionController');
const { 
  validateTransaction, 
  handleValidationErrors 
} = require('../middleware/validationMiddleware');
const { 
  transactionLimiter, 
  apiLimiter 
} = require('../middleware/rateLimitMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Transaction CRUD operations
router.post('/', transactionLimiter, validateTransaction, handleValidationErrors, createTransaction);
router.get('/', apiLimiter, getTransactions);
router.get('/stats', apiLimiter, getTransactionStats);
router.get('/categories', apiLimiter, getTransactionCategories);
router.get('/:id', apiLimiter, getTransactionById);
router.put('/:id', apiLimiter, validateTransaction, handleValidationErrors, updateTransaction);
router.delete('/:id', apiLimiter, deleteTransaction);
router.delete('/bulk', apiLimiter, bulkDeleteTransactions);

module.exports = router;
