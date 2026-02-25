
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  partnerId: mongoose.Types.ObjectId;
  transactionDate: Date;
  amount: number;
  currency: string;
  paymentMethod: "Bank Transfer" | "PayPal" | "Stripe";
  transactionId: string;
  status: "Completed" | "Processing" | "Failed";
  paymentProofUrl?: string;
  enrollmentIds: mongoose.Types.ObjectId[];
}

const TransactionSchema: Schema = new Schema({
  partnerId: { type: Schema.Types.ObjectId, ref: 'Affiliate', required: true },
  transactionDate: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  paymentMethod: { type: String, enum: ["Bank Transfer", "PayPal", "Stripe"], required: true },
  transactionId: { type: String, required: true },
  status: { type: String, enum: ["Completed", "Processing", "Failed"], default: "Processing" },
  paymentProofUrl: { type: String },
  enrollmentIds: [{ type: Schema.Types.ObjectId, ref: 'Enrollment' }],
}, {
  toJSON: {
    virtuals: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform: function (doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  },
  toObject: { virtuals: true }
});

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
