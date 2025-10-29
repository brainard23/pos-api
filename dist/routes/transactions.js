"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const transactionController_1 = require("../controllers/transactionController");
const router = express_1.default.Router();
const validateTransaction = [
    (0, express_validator_1.body)('items').isArray().withMessage('Items must be an array'),
    (0, express_validator_1.body)('items.*.product').isMongoId().withMessage('Invalid product ID'),
    (0, express_validator_1.body)('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    (0, express_validator_1.body)('paymentMethod').isIn(['cash', 'gcash', 'credit_card', 'card']).withMessage('Invalid payment method'),
    // (0, express_validator_1.body)('discount').optional().isObject().withMessage('Discount must be an object'),
    // (0, express_validator_1.body)('discount.type').optional().isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
    // (0, express_validator_1.body)('discount.value').optional().isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),
    // (0, express_validator_1.body)('discount.code').optional().isString().trim().withMessage('Discount code must be a string')
];
router.get('/', auth_1.protect, transactionController_1.getTransactions);
router.get('/stats', auth_1.protect, transactionController_1.getTransactionStats);
router.get('/:id', auth_1.protect, transactionController_1.getTransaction);
router.post('/', auth_1.protect, (0, validate_1.validate)(validateTransaction), transactionController_1.createTransaction);
router.post('/:id/cancel', auth_1.protect, transactionController_1.cancelTransaction);
exports.default = router;
//# sourceMappingURL=transactions.js.map