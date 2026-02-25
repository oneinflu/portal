
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAffiliate extends Document {
  id: string; // We'll keep the custom ID for now or map _id to id
  name: string;
  email: string;
  phone: string;
  passwordHash?: string;
  referralCode: string;
  status: "Accepted" | "Pending";
  joined: Date;
  amount: number;
}

const AffiliateSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  passwordHash: { type: String }, // Optional until they set it? Or required for signup?
  referralCode: { type: String, required: true, unique: true },
  status: { type: String, enum: ["Accepted", "Pending"], default: "Pending" },
  joined: { type: Date, default: Date.now },
  amount: { type: Number, default: 0 },
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

const Affiliate: Model<IAffiliate> = mongoose.models.Affiliate || mongoose.model<IAffiliate>('Affiliate', AffiliateSchema);

export default Affiliate;
