import express from 'express';
import { body } from 'express-validator';
import { protect as auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController';

const router = express.Router();

// Validation middleware
const validateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('minStock').isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
  body('supplier').notEmpty().withMessage('Supplier is required'),
  body('unit').isIn(['piece', 'kg', 'g', 'l', 'ml', 'box', 'pack']).withMessage('Invalid unit'),
];

// Routes
router.get('/', auth, getProducts);
router.get('/:id', auth, getProduct);
router.post('/', [auth, validate(validateProduct)], createProduct);
router.put('/:id', [auth, validate(validateProduct)], updateProduct);
router.delete('/:id', auth, deleteProduct);

export default router; 