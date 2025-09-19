import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true
  },
  email: {
    type: String,
    // required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    // required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    street: {
      type: String,
      // required: [true, 'Street address is required']
    },
    city: {
      type: String,
      // required: [true, 'City is required']
    },
    state: {
      type: String,
      // required: [true, 'State is required']
    },
    country: {
      type: String,
      // required: [true, 'Country is required']
    },
    zipCode: {
      type: String,
      // required: [true, 'ZIP code is required']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
supplierSchema.index({ name: 'text', email: 'text' });
supplierSchema.index({ 'address.city': 1, 'address.country': 1 });

// Add virtual for products
supplierSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'supplier'
});

// Enable virtuals in JSON
supplierSchema.set('toJSON', { virtuals: true });
supplierSchema.set('toObject', { virtuals: true });

export default mongoose.model<ISupplier>('Supplier', supplierSchema); 