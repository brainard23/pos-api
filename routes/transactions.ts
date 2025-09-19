import express from 'express';
import { body } from 'express-validator';
import { protect as auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  cancelTransaction,
  getTransactionStats
} from '../controllers/transactionController';

const router = express.Router();

// Validation middleware
const validateTransaction = [
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.product').isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentMethod').isIn(['cash', 'gcash', 'credit_card', 'card']).withMessage('Invalid payment method'),
  body('discount').optional().isObject().withMessage('Discount must be an object'),
  body('discount.type').optional().isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
  body('discount.value').optional().isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),
  body('discount.code').optional().isString().trim().withMessage('Discount code must be a string')
];

// Routes
router.get('/', auth, getTransactions);
router.get('/stats', auth, getTransactionStats);
router.get('/:id', auth, getTransaction);
router.post('/', auth, validate(validateTransaction), createTransaction);
router.post('/:id/cancel', auth, cancelTransaction);

export default router; 