/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Affiliate from '@/models/Affiliate';
import Enrollment from '@/models/Enrollment';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';

export async function GET() {
  await dbConnect();

  try {
    // Find all pending enrollments
    const pendingEnrollments = await Enrollment.find({ payoutStatus: 'Pending' }).populate('partnerId');

    // Group by partnerId
    const payoutsMap = new Map();

    pendingEnrollments.forEach((enrollment: any) => {
      const partner = enrollment.partnerId;
      if (!partner) return; // Should not happen

      const partnerId = partner._id.toString();
      
      if (!payoutsMap.has(partnerId)) {
        payoutsMap.set(partnerId, {
          affiliateId: partnerId,
          name: partner.name,
          email: partner.email,
          phone: partner.phone,
          enrollmentsCount: 0,
          totalPayable: 0,
          status: 'pending',
          date: enrollment.joined // Initial date
        });
      }

      const payout = payoutsMap.get(partnerId);
      payout.enrollmentsCount += 1;
      payout.totalPayable += enrollment.commission;
    });

    return NextResponse.json(Array.from(payoutsMap.values()));
  } catch (error) {
    console.error("Payouts fetch error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { affiliateId, amount, transactionId, paymentMethod, date, proofUrl } = body;

    if (!affiliateId || !amount || !transactionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Get pending enrollments for this affiliate
    const pendingEnrollments = await Enrollment.find({ 
      partnerId: affiliateId, 
      payoutStatus: 'Pending' 
    });

    const pendingEnrollmentIds = pendingEnrollments.map(e => e._id);

    if (pendingEnrollmentIds.length === 0) {
      return NextResponse.json({ error: 'No pending enrollments found' }, { status: 400 });
    }

    // 2. Create Transaction
    const newTransaction = await Transaction.create({
      partnerId: affiliateId,
      transactionDate: date || new Date(),
      amount: Number(amount),
      currency: 'USD',
      paymentMethod: paymentMethod || 'Bank Transfer',
      transactionId,
      status: 'Completed',
      paymentProofUrl: proofUrl,
      enrollmentIds: pendingEnrollmentIds
    });

    // 3. Update Enrollments status
    await Enrollment.updateMany(
      { _id: { $in: pendingEnrollmentIds } },
      { $set: { payoutStatus: 'Paid' } }
    );

    return NextResponse.json({ success: true, transaction: newTransaction });
  } catch (error) {
    console.error("Payout process error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
