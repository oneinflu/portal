
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Affiliate from '@/models/Affiliate';
import Transaction from '@/models/Transaction';

async function getPartner(req: NextRequest) {
  const email = req.headers.get('x-partner-email') || 'liam.j@example.com';
  return Affiliate.findOne({ email });
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const partner = await getPartner(req);
    
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    const transactions = await Transaction.find({ partnerId: partner._id }).sort({ transactionDate: -1 });

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
