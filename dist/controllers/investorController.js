"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInvestor = exports.updateInvestor = exports.getInvestorPerformance = exports.createInvestor = exports.listInvestors = void 0;
const express_validator_1 = require("express-validator");
const Investor_1 = __importDefault(require("../models/Investor"));
const listInvestors = async (_req, res, next) => {
    try {
        const investors = await Investor_1.default.find().sort({ createdAt: -1 });
        res.json(investors);
    }
    catch (err) {
        next(err);
    }
};
exports.listInvestors = listInvestors;
const createInvestor = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const investor = await Investor_1.default.create(req.body);
        res.status(201).json(investor);
    }
    catch (err) {
        next(err);
    }
};
exports.createInvestor = createInvestor;
const getInvestorPerformance = async (_req, res, next) => {
    try {
        const investors = await Investor_1.default.find();
        const performance = investors.map(inv => {
            const monthlyPayment = (inv.principal + inv.principal * inv.interest) / inv.months;
            return {
                investorId: inv._id,
                name: inv.name,
                email: inv.email,
                principal: inv.principal,
                interest: inv.interest,
                months: inv.months,
                monthlyPayment,
                startDate: inv.startDate,
            };
        });
        res.json(performance);
    }
    catch (err) {
        next(err);
    }
};
exports.getInvestorPerformance = getInvestorPerformance;
const updateInvestor = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { id } = req.params;
        const updated = await Investor_1.default.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ message: 'Investor not found' });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updateInvestor = updateInvestor;
const deleteInvestor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await Investor_1.default.findByIdAndDelete(id);
        if (!deleted) {
            res.status(404).json({ message: 'Investor not found' });
            return;
        }
        res.json({ message: 'Investor deleted' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteInvestor = deleteInvestor;
//# sourceMappingURL=investorController.js.map