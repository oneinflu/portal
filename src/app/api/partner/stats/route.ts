
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Affiliate from '@/models/Affiliate';
import Enrollment from '@/models/Enrollment';
import Transaction from '@/models/Transaction';

async function getPartner(req: NextRequest) {
  // For demo, we'll use a hardcoded email if no header is present
  // In a real app, this would come from the session/token
  const email = req.headers.get('x-partner-email') || 'liam.j@example.com';
  const partner = await Affiliate.findOne({ email });
  return partner;
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const partner = await getPartner(req);
    
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    const partnerId = partner._id;

    // Get Enrollments for Pending Commission
    const enrollments = await Enrollment.find({ partnerId });
    const pendingCommission = enrollments
      .filter(e => e.payoutStatus === 'Pending')
      .reduce((sum, e) => sum + e.commission, 0);

    // Get Transactions for Received Amount
    const transactions = await Transaction.find({ partnerId, status: 'Completed' });
    const totalReceived = transactions.reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      lifetimeEarnings: totalReceived + pendingCommission,
      totalReceived,
      totalToBeReceived: pendingCommission,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
