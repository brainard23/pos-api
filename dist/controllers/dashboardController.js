"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const getDashboard = async (_req, res, next) => {
    try {
        const lowStockThreshold = 5;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const total = await Product_1.default.countDocuments();
        const lowStockItems = await Product_1.default.countDocuments({ stock: { $lt: lowStockThreshold } });
        const totalTransactions = await Transaction_1.default.countDocuments({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });
        const sales = await Transaction_1.default.aggregate([
            {
                $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } }
            },
            {
                $group: { _id: null, totalSales: { $sum: "$total" } }
            }
        ]);
        const totalSales = sales.length > 0 ? sales[0].totalSales : 0;
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const profitSeries = await Transaction_1.default.aggregate([
            { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
            { $unwind: '$items' },
            { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    revenue: { $sum: '$total' },
                    cost: { $sum: { $multiply: ['$items.quantity', '$product.cost'] } },
                }
            },
            { $addFields: { profit: { $subtract: ['$revenue', '$cost'] } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        const recentTx = await Transaction_1.default.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('items.product', 'name');
        const recentActivity = recentTx.map(t => {
            var _a, _b, _c;
            return ({
                action: 'Sale',
                item: ((_b = (_a = t.items) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.product) && t.items[0].product.name ? `${t.items[0].product.name}${t.items.length > 1 ? ` +${t.items.length - 1} more` : ''}` : `${((_c = t.items) === null || _c === void 0 ? void 0 : _c.length) || 0} items`,
                amount: `$${Number(t.total || 0).toFixed(2)}`,
                time: new Date(t.createdAt).toLocaleString(),
            });
        });
        res.json({
            totalSales: totalSales,
            totalTransactions: totalTransactions,
            lowStockItems: lowStockItems,
            totalProducts: total,
            profitSeries: profitSeries.map(p => ({ month: `${p._id.year}-${String(p._id.month).padStart(2, '0')}`, profit: p.profit })),
            recentActivity,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboard = getDashboard;
//# sourceMappingURL=dashboardController.js.map