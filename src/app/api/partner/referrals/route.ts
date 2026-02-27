
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Affiliate from '@/models/Affiliate';
import Referral from '@/models/Referral';

async function getPartner(req: NextRequest) {
  const email = req.headers.get('x-partner-email');
  if (!email) return null;
  return Affiliate.findOne({ email });
}

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const partner = await getPartner(req);
    if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });

    const referrals = await Referral.find({ partnerId: partner._id }).sort({ dateAdded: -1 });
    return NextResponse.json(referrals);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const partner = await getPartner(req);
    if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });

    const body = await req.json();
    const newReferral = await Referral.create({
      partnerId: partner._id,
      name: body.name,
      email: body.email,
      phone: body.phone,
      status: 'pending',
      dateAdded: new Date()
    });
    
    return NextResponse.json(newReferral, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
