"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const supplierController_1 = require("../controllers/supplierController");
const router = express_1.default.Router();
const validateSupplier = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Supplier name is required'),
];
router.get('/', auth_1.protect, supplierController_1.getSuppliers);
router.get('/:id', auth_1.protect, supplierController_1.getSupplier);
router.post('/', [auth_1.protect, (0, validate_1.validate)(validateSupplier)], supplierController_1.createSupplier);
router.put('/:id', [auth_1.protect, (0, validate_1.validate)(validateSupplier)], supplierController_1.updateSupplier);
router.delete('/:id', auth_1.protect, supplierController_1.deleteSupplier);
exports.default = router;
//# sourceMappingURL=suppliers.js.map