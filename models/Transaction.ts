import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from './Product';

export interface ITransactionItem {
  product: IProduct['_id'];
  quantity: number;
  price: number;     // Selling price
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'gcash' | 'credit_card' | 'card';

export interface ITransaction extends Document {
  items: ITransactionItem[];
  subtotal: number;
  discount?: number;
  discountAmount: number;
  total: number;
  profit: number;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const transactionItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative'],
  },
});

const transactionSchema = new Schema<ITransaction>(
  {
    items: {
      type: [transactionItemSchema],
      required: [true, 'Transaction items are required'],
      validate: {
        validator: function (items: ITransactionItem[]) {
          return items.length > 0;
        },
        message: 'Transaction must have at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      default: 0,
    },
    discountAmount: {
      type: Number,
      required: [true, 'Discount amount is required'],
      min: [0, 'Discount amount cannot be negative'],
      default: 0,
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
    },
    profit: {
      type: Number,
      required: [true, 'Profit is required'],
      min: [0, 'Profit cannot be negative'],
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'gcash', 'credit_card', 'card'],
      required: [true, 'Payment method is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Pre-save hook: calculate subtotal, discount, total, and profit
transactionSchema.pre('save', async function (next) {
  const Product = mongoose.model('Product');

  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);

  // Calculate discount amount and total
  this.discountAmount = this.discount || 0;
  this.total = Math.max(this.subtotal - this.discountAmount, 0);

  // ✅ Calculate profit for each item
  let totalProfit = 0;

  for (const item of this.items) {
    const product = await Product.findById(item.product).lean<IProduct>();
    if (product && typeof product.cost === 'number') {
      const itemProfit = (item.price - product.cost) * item.quantity;
      totalProfit += itemProfit > 0 ? itemProfit : 0; 
    }
  }

 // ✅ Deduct the discount from total profit
  const adjustedProfit = totalProfit - (this.discountAmount || 0);

  // Ensure profit doesn’t go below zero
  this.profit = adjustedProfit > 0 ? adjustedProfit : 0;

  next();
});

// Enable virtuals in JSON
transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

// Indexes for performance
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ paymentMethod: 1 });

export default mongoose.model<ITransaction>('Transaction', transactionSchema);
