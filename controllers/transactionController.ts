import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Transaction, { ITransaction, PaymentMethod } from '../models/Transaction';
import Product from '../models/Product';

/**
 * Get all transactions with pagination and filters
 * @param req Request object containing query parameters for pagination and filters
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const paymentMethod = req.query.paymentMethod as PaymentMethod;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Build query based on filters
    const query: any = {};
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
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
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single transaction by ID
 * @param req Request object containing transaction ID
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const getTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('items.product', 'name sku price cost');

    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    res.json(transaction);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new transaction
 * @param req Request object containing transaction data
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const createTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { items, paymentMethod, discount } = req.body;

    // Validate and process items
    const processedItems = await Promise.all(items.map(async (item: any) => {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      // Calculate subtotal
      const subtotal = product.price * item.quantity;

      // Update product stock
      product.stock -= item.quantity;
      await product.save();

      return {
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        subtotal
      };
    }));

    // Calculate totals
    const subtotal = processedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = discount ? (discount.type === 'percentage' ? (subtotal * discount.value / 100) : discount.value) : 0;
    const total = subtotal - discountAmount;

    // Create transaction
    const transaction = new Transaction({
      items: processedItems,
      paymentMethod,
      discount,
      subtotal,
      discountAmount,
      total,
      status: 'completed' // Auto-complete the transaction
    });

    await transaction.save();

    // Populate product details in response
    await transaction.populate('items.product', 'name sku price cost');

    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a transaction
 * @param req Request object containing transaction ID
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const cancelTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    if (transaction.status === 'cancelled') {
      res.status(400).json({ message: 'Transaction is already cancelled' });
      return;
    }

    // Restore product stock
    await Promise.all(transaction.items.map(async (item) => {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }));

    // Update transaction status
    transaction.status = 'cancelled';
    await transaction.save();

    res.json({ message: 'Transaction cancelled successfully', transaction });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transaction statistics
 * @param req Request object
 * @param res Response object
 * @param next NextFunction for error handling
 */
export const getTransactionStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

    const stats = await Transaction.aggregate([
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

    // Process payment method breakdown
    const paymentMethodStats = stats[0]?.paymentMethodBreakdown.reduce((acc: any, curr: any) => {
      acc[curr.method] = (acc[curr.method] || 0) + curr.amount;
      return acc;
    }, {}) || {};

    res.json({
      totalSales: stats[0]?.totalSales || 0,
      totalTransactions: stats[0]?.totalTransactions || 0,
      averageTransactionValue: stats[0]?.averageTransactionValue || 0,
      paymentMethodBreakdown: paymentMethodStats
    });
  } catch (error) {
    next(error);
  }
}; 