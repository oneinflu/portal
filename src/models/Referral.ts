
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReferral extends Document {
  partnerId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  status: "pending" | "enrolled";
  dateAdded: Date;
}

const ReferralSchema: Schema = new Schema({
  partnerId: { type: Schema.Types.ObjectId, ref: 'Affiliate', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ["pending", "enrolled"], default: "pending" },
  dateAdded: { type: Date, default: Date.now },
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

const Referral: Model<IReferral> = mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);

export default Referral;
