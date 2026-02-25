
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEnrollment extends Document {
  partnerId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  course: string;
  joined: Date;
  package: string;
  plan: "Monthly" | "Annual";
  commissionRate: number;
  paidAmount: number;
  commission: number;
  payoutStatus: "Paid" | "Pending";
}

const EnrollmentSchema: Schema = new Schema({
  partnerId: { type: Schema.Types.ObjectId, ref: 'Affiliate', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  course: { type: String, required: true },
  joined: { type: Date, default: Date.now },
  package: { type: String, required: true },
  plan: { type: String, enum: ["Monthly", "Annual"], required: true },
  commissionRate: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  commission: { type: Number, required: true },
  payoutStatus: { type: String, enum: ["Paid", "Pending"], default: "Pending" },
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

const Enrollment: Model<IEnrollment> = mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);

export default Enrollment;
