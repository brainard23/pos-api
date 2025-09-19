"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const investorController_1 = require("../controllers/investorController");
const router = express_1.default.Router();
router.get('/', auth_1.protect, investorController_1.listInvestors);
router.get('/performance', auth_1.protect, investorController_1.getInvestorPerformance);
router.post('/', auth_1.protect, (0, validate_1.validate)([
    (0, express_validator_1.body)('name').isString().trim().notEmpty(),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('principal').isFloat({ min: 0 }),
    (0, express_validator_1.body)('interest').isFloat({ min: 0 }),
    (0, express_validator_1.body)('months').isInt({ min: 1 }),
    (0, express_validator_1.body)('startDate').isISO8601(),
]), investorController_1.createInvestor);
router.put('/:id', auth_1.protect, (0, validate_1.validate)([
    (0, express_validator_1.body)('name').optional().isString().trim().notEmpty(),
    (0, express_validator_1.body)('email').optional().isEmail().normalizeEmail(),
    (0, express_validator_1.body)('principal').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('interest').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('months').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('startDate').optional().isISO8601(),
]), investorController_1.updateInvestor);
router.delete('/:id', auth_1.protect, investorController_1.deleteInvestor);
exports.default = router;
//# sourceMappingURL=investors.js.map