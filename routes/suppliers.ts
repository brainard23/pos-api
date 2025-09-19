import express from 'express';
import { body } from 'express-validator';
import { protect as auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '../controllers/supplierController';

const router = express.Router();

// Validation middleware
const validateSupplier = [
  body('name').trim().notEmpty().withMessage('Supplier name is required'),
];

// Routes
router.get('/', auth, getSuppliers);
router.get('/:id', auth, getSupplier);
router.post('/', [auth, validate(validateSupplier)], createSupplier);
router.put('/:id', [auth, validate(validateSupplier)], updateSupplier);
router.delete('/:id', auth, deleteSupplier);

export default router; 