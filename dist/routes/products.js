"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const productController_1 = require("../controllers/productController");
const router = express_1.default.Router();
const validateProduct = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Product name is required'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('category').notEmpty().withMessage('Category is required'),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
    (0, express_validator_1.body)('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    (0, express_validator_1.body)('minStock').isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
    (0, express_validator_1.body)('supplier').notEmpty().withMessage('Supplier is required'),
    (0, express_validator_1.body)('unit').isIn(['piece', 'kg', 'g', 'l', 'ml', 'box', 'pack']).withMessage('Invalid unit'),
];
router.get('/', auth_1.protect, productController_1.getProducts);
router.get('/:id', auth_1.protect, productController_1.getProduct);
router.post('/', [auth_1.protect, (0, validate_1.validate)(validateProduct)], productController_1.createProduct);
router.put('/:id', [auth_1.protect, (0, validate_1.validate)(validateProduct)], productController_1.updateProduct);
router.delete('/:id', auth_1.protect, productController_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=products.js.map