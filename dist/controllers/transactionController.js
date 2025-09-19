"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionStats = exports.cancelTransaction = exports.createTransaction = exports.getTransaction = exports.getTransactions = void 0;
const express_validator_1 = require("express-validator");
const Transaction_1 = __importDefault(require("../models/Transaction"));
const Product_1 = __importDefault(require("../models/Product"));
const getTransactions = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const paymentMethod = req.query.paymentMethod;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const query = {};
        if (status)
            query.status = status;
        if (paymentMethod)
            query.paymentMethod = paymentMethod;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
        }
        const total = await Transaction_1.default.countDocuments(query);
        const transactions = await Transaction_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('items.product', 'name sku price cost');
        res.json({
            transactions,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalTransactions: total,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTransactions = getTransactions;
const getTransaction = async (req, res, next) => {
    try {
        const transaction = await Transaction_1.default.findById(req.params.id)
            .populate('items.product', 'name sku price cost');
        if (!transaction) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }
        res.json(transaction);
    }
    catch (error) {
        next(error);
    }
};
exports.getTransaction = getTransaction;
const createTransaction = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { items, paymentMethod, discount } = req.body;
        const processedItems = await Promise.all(items.map(async (item) => {
            const product = await Product_1.default.findById(item.product);
            if (!product) {
                throw new Error(`Product not found: ${item.product}`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product: ${product.name}`);
            }
            const subtotal = product.price * item.quantity;
            product.stock -= item.quantity;
            await product.save();
            return {
                product: product._id,
                quantity: item.quantity,
                price: product.price,
                subtotal
            };
        }));
        const subtotal = processedItems.reduce((sum, item) => sum + item.subtotal, 0);
        const discountAmount = discount ? (discount.type === 'percentage' ? (subtotal * discount.value / 100) : discount.value) : 0;
        const total = subtotal - discountAmount;
        const transaction = new Transaction_1.default({
            items: processedItems,
            paymentMethod,
            discount,
            subtotal,
            discountAmount,
            total,
            status: 'completed'
        });
        await transaction.save();
        await transaction.populate('items.product', 'name sku price cost');
        res.status(201).json(transaction);
    }
    catch (error) {
        next(error);
    }
};
exports.createTransaction = createTransaction;
const cancelTransaction = async (req, res, next) => {
    try {
        const transaction = await Transaction_1.default.findById(req.params.id);
        if (!transaction) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }
        if (transaction.status === 'cancelled') {
            res.status(400).json({ message: 'Transaction is already cancelled' });
            return;
        }
        await Promise.all(transaction.items.map(async (item) => {
            const product = await Product_1.default.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }));
        transaction.status = 'cancelled';
        await transaction.save();
        res.json({ message: 'Transaction cancelled successfully', transaction });
    }
    catch (error) {
        next(error);
    }
};
exports.cancelTransaction = cancelTransaction;
const getTransactionStats = async (req, res, next) => {
    var _a, _b, _c, _d;
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
        const stats = await Transaction_1.default.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$total' },
                    totalTransactions: { $sum: 1 },
                    averageTransactionValue: { $avg: '$total' },
                    paymentMethodBreakdown: {
                        $push: {
                            method: '$paymentMethod',
                            amount: '$total'
                        }
                    }
                }
            }
        ]);
        const paymentMethodStats = ((_a = stats[0]) === null || _a === void 0 ? void 0 : _a.paymentMethodBreakdown.reduce((acc, curr) => {
            acc[curr.method] = (acc[curr.method] || 0) + curr.amount;
            return acc;
        }, {})) || {};
        res.json({
            totalSales: ((_b = stats[0]) === null || _b === void 0 ? void 0 : _b.totalSales) || 0,
            totalTransactions: ((_c = stats[0]) === null || _c === void 0 ? void 0 : _c.totalTransactions) || 0,
            averageTransactionValue: ((_d = stats[0]) === null || _d === void 0 ? void 0 : _d.averageTransactionValue) || 0,
            paymentMethodBreakdown: paymentMethodStats
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTransactionStats = getTransactionStats;
//# sourceMappingURL=transactionController.js.map