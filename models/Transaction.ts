import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from './Product';

export interface ITransactionItem {
  product: IProduct['_id'];
  quantity: number;
  price: number;
  subtotal: number;
}

export interface IDiscount {
  type: 'percentage' | 'fixed';
  value: number;
  code?: string;
}

export type PaymentMethod = 'cash' | 'gcash' | 'credit_card' | 'card';

export interface ITransaction extends Document {
  items: ITransactionItem[];
  subtotal: number;
  discount?: IDiscount;
  discountAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const transactionItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  }
});

const discountSchema = new Schema({
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required']
  },
  value: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative']
  },
  code: {
    type: String,
    trim: true
  }
});

const transactionSchema = new Schema({
  items: {
    type: [transactionItemSchema],
    required: [true, 'Transaction items are required'],
    validate: {
      validator: function(items: ITransactionItem[]) {
        return items.length > 0;
      },
      message: 'Transaction must have at least one item'
    }
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  discount: {
    type: discountSchema
  },
  discountAmount: {
    type: Number,
    required: [true, 'Discount amount is required'],
    min: [0, 'Discount amount cannot be negative'],
    default: 0
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'gcash', 'credit_card', 'card'],
    required: [true, 'Payment method is required']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ paymentMethod: 1 });

// Pre-save middleware to calculate totals
transactionSchema.pre('save', function(next) {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);

  // Calculate discount amount if discount exists
  if (this.discount) {
    if (this.discount.type === 'percentage') {
      this.discountAmount = (this.subtotal * this.discount.value) / 100;
    } else {
      this.discountAmount = this.discount.value;
    }
  }

  // Calculate total
  this.total = this.subtotal - this.discountAmount;

  next();
});

// Enable virtuals in JSON
transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

export default mongoose.model<ITransaction>('Transaction', transactionSchema); 