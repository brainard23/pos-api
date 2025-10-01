import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import Transaction from '../models/Transaction';

/**
 * Get all products with pagination and search
 * @param req Request object containing query parameters for pagination and search
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const getDashboard = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, totalSales: { $sum: "$total" } } }
    ]);
    const totalSales = sales.length > 0 ? sales[0].totalSales : 0;

    // Profit series for last 6 months (including current)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Step 1: compute per-transaction revenue and transactionCost
    const perTransaction = await Transaction.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo, $lte: now } } },

      // unwind items to compute cost per item
      { $unwind: '$items' },

      // lookup product to get product.cost
      { $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
      } },

      // unwind product (keep nulls to avoid errors if product was deleted)
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },

      // group back to per-transaction to sum costs and keep the transaction total (or subtotal)
      {
        $group: {
          _id: '$_id',
          year: { $first: { $year: '$createdAt' } },
          month: { $first: { $month: '$createdAt' } },

          // Use '$total' for revenue after discount. If you want pre-discount revenue use '$subtotal' here.
          revenue: { $first: '$total' },

          // sum item-level cost = sum(quantity * product.cost)
          transactionCost: {
            $sum: {
              $multiply: [
                '$items.quantity',
                { $ifNull: ['$product.cost', 0] }
              ]
            }
          }
        }
      },

      // group by year/month to get monthly totals
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          revenue: { $sum: '$revenue' },
          cost: { $sum: '$transactionCost' }
        }
      },

      // compute profit
      { $addFields: { profit: { $subtract: ['$revenue', '$cost'] } } },

      // sort chronological
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Build an ordered 6-month series (fill missing months with 0)
    const profitMap: Record<string, number> = {};
    perTransaction.forEach(p => {
      const key = `${p._id.year}-${String(p._id.month).padStart(2, '0')}`;
      profitMap[key] = p.profit ?? 0;
    });

    const profitSeries = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      profitSeries.push({ month: key, profit: profitMap[key] || 0 });
    }

    // Recent activity (last 10 transactions)
    const recentTx = await Transaction.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('items.product', 'name');

    const recentActivity = recentTx.map(t => ({
      action: 'Sale',
      item: t.items?.[0]?.product && (t.items[0].product as any).name ? `${(t.items[0].product as any).name}${t.items.length > 1 ? ` +${t.items.length - 1} more` : ''}` : `${t.items?.length || 0} items`,
      amount: `$${Number(t.total || 0).toFixed(2)}`,
      time: new Date(t.createdAt).toLocaleString(),
    }));

    res.json({
      totalSales: totalSales,
      totalTransactions: totalTransactions,
      lowStockItems: lowStockItems,
      totalProducts: total,
      profitSeries,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};
