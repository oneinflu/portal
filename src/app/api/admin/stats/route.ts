
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Affiliate from '@/models/Affiliate';
import Enrollment from '@/models/Enrollment';

export async function GET() {
  await dbConnect();

  try {
    const totalPartners = await Affiliate.countDocuments();
    
    const enrollments = await Enrollment.find().sort({ joined: -1 });
    const totalRevenue = enrollments.reduce((acc, curr) => acc + curr.paidAmount, 0);
    const activeStudents = enrollments.length;

    return NextResponse.json({
      totalPartners,
      totalRevenue,
      activeStudents,
      recentActivity: enrollments.slice(0, 5).map(e => ({
        id: e.id,
        user: e.name,
        action: `enrolled in ${e.package}`,
        date: e.joined,
        amount: e.paidAmount
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
