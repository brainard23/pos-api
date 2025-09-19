import express from 'express';
import { body } from 'express-validator';
import { protect as auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';

const router = express.Router();

// Validation middleware
const validateCategory = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
];

// Routes
router.get('/', auth, getCategories);
router.get('/:id', auth, getCategory);
router.post('/', [auth, validate(validateCategory)], createCategory);
router.put('/:id', [auth, validate(validateCategory)], updateCategory);
router.delete('/:id', auth, deleteCategory);

export default router; 