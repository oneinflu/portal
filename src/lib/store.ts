
export interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone: string;
  referralCode: string;
  status: "Accepted" | "Pending";
  joined: string;
  amount: number;
}

export interface Enrollment {
  id: string;
  partnerId: string; // Link to affiliate
  name: string;
  email: string;
  course: string;
  joined: string;
  package: string;
  plan: "Monthly" | "Annual";
  commissionRate: number;
  paidAmount: number;
  commission: number;
  payoutStatus: "Paid" | "Pending";
}

export interface Transaction {
  id: string;
  partnerId: string;
  transactionDate: string;
  amount: number;
  currency: string;
  paymentMethod: "Bank Transfer" | "PayPal" | "Stripe";
  transactionId: string;
  status: "Completed" | "Processing" | "Failed";
  paymentProofUrl?: string;
  enrollmentIds: string[];
}

export interface Referral {
  id: string;
  partnerId: string;
  name: string;
  email: string;
  phone: string;
  status: "pending" | "enrolled";
  dateAdded: string;
}
