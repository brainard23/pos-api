import mongoose, { Schema, Document } from 'mongoose';

export interface IInvestor extends Document {
  name: string;
  email: string;
  principal: number;
  interest: number; // decimal, e.g., 0.1 for 10%
  months: number; // loan/investment duration
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const investorSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  principal: { type: Number, required: true, min: 0 },
  interest: { type: Number, required: true, min: 0 },
  months: { type: Number, required: true, min: 1 },
  startDate: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model<IInvestor>('Investor', investorSchema);



