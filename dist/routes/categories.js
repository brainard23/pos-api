"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const categoryController_1 = require("../controllers/categoryController");
const router = express_1.default.Router();
const validateCategory = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Category name is required'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
];
router.get('/', auth_1.protect, categoryController_1.getCategories);
router.get('/:id', auth_1.protect, categoryController_1.getCategory);
router.post('/', [auth_1.protect, (0, validate_1.validate)(validateCategory)], categoryController_1.createCategory);
router.put('/:id', [auth_1.protect, (0, validate_1.validate)(validateCategory)], categoryController_1.updateCategory);
router.delete('/:id', auth_1.protect, categoryController_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=categories.js.map