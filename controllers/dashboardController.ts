import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import Transaction from '../models/Transaction';

/**
 * Get all products with pagination and search
 * @param req Request object containing query parameters for pagination and search
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lowStockThreshold = 5;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const total = await Product.countDocuments();
    const lowStockItems = await Product.countDocuments({ stock: { $lt: lowStockThreshold } });
   const totalTransactions = await Transaction.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

        const sales = await Transaction.aggregate([
      {
        $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } }
      },
      {
        $group: { _id: null, totalSales: { $sum: "$total" } }
      }
    ]);

    const totalSales = sales.length > 0 ? sales[0].totalSales : 0;

    // Profit series for last 6 months (including current)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const profitSeries = await Transaction.aggregate([
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

    // Recent activity (last 10 transactions)
    const recentTx = await Transaction.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('items.product', 'name');

    const recentActivity = recentTx.map(t => ({
      action: 'Sale',
      item: t.items?.[0]?.product && (t.items[0].product as any).name ? `${(t.items[0].product as any).name}${t.items.length > 1 ? ` +${t.items.length - 1} more` : ''}` : `${t.items?.length || 0} items` ,
      amount: `$${Number(t.total || 0).toFixed(2)}`,
      time: new Date(t.createdAt).toLocaleString(),
    }));

    res.json({
      totalSales: totalSales,
      totalTransactions: totalTransactions,
      lowStockItems: lowStockItems,
      totalProducts: total,
      profitSeries: profitSeries.map(p => ({ month: `${p._id.year}-${String(p._id.month).padStart(2, '0')}`, profit: p.profit })),
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};