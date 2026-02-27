
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Affiliate from '@/models/Affiliate';
import Enrollment from '@/models/Enrollment';

async function getPartner(req: NextRequest) {
  const email = req.headers.get('x-partner-email');
  if (!email) return null;
  return Affiliate.findOne({ email });
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const partner = await getPartner(req);
    
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    const enrollments = await Enrollment.find({ partnerId: partner._id }).sort({ joined: -1 });

    return NextResponse.json(enrollments);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
