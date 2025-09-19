import express from 'express';
import { body } from 'express-validator';
import { protect as auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { listInvestors, createInvestor, getInvestorPerformance, updateInvestor, deleteInvestor } from '../controllers/investorController';

const router = express.Router();

router.get('/', auth, listInvestors);
router.get('/performance', auth, getInvestorPerformance);
router.post(
  '/',
  auth,
  validate([
    body('name').isString().trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('principal').isFloat({ min: 0 }),
    body('interest').isFloat({ min: 0 }),
    body('months').isInt({ min: 1 }),
    body('startDate').isISO8601(),
  ]),
  createInvestor
);

router.put(
  '/:id',
  auth,
  validate([
    body('name').optional().isString().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('principal').optional().isFloat({ min: 0 }),
    body('interest').optional().isFloat({ min: 0 }),
    body('months').optional().isInt({ min: 1 }),
    body('startDate').optional().isISO8601(),
  ]),
  updateInvestor
);

router.delete('/:id', auth, deleteInvestor);

export default router;


