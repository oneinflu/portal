/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import Affiliate from '@/models/Affiliate';

export async function GET() {
  await dbConnect();
  try {
    const transactions = await Transaction.find().populate('partnerId').sort({ transactionDate: -1 });

    const enrichedTransactions = transactions.map((transaction: any) => {
      const affiliate = transaction.partnerId;
      
      return {
        id: transaction.id,
        date: transaction.transactionDate,
        affiliateName: affiliate ? affiliate.name : 'Unknown',
        email: affiliate ? affiliate.email : '',
        amount: transaction.amount,
        paymentMode: transaction.paymentMethod,
        enrollmentsCount: transaction.enrollmentIds.length,
        proofUrl: transaction.paymentProofUrl || '#',
        status: transaction.status === 'Completed' ? 'Success' : transaction.status,
      };
    });

    return NextResponse.json(enrichedTransactions);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
