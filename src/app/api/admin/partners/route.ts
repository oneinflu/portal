/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Affiliate from '@/models/Affiliate';
import Enrollment from '@/models/Enrollment';

export async function GET() {
  await dbConnect();
  try {
    const affiliates = await Affiliate.find().sort({ joined: -1 });

    // Aggregate stats from Enrollments
    const stats = await Enrollment.aggregate([
      { 
        $group: {
          _id: "$partnerId",
          count: { $sum: 1 },
          payoutBalance: { 
            $sum: { $cond: [{ $eq: ["$payoutStatus", "Pending"] }, "$commission", 0] }
          },
          totalPaid: {
            $sum: { $cond: [{ $eq: ["$payoutStatus", "Paid"] }, "$commission", 0] }
          }
        }
      }
    ]);

    const statsMap = new Map();
    stats.forEach((s: any) => {
      if (s._id) statsMap.set(s._id.toString(), s);
    });

    const enrichedAffiliates = affiliates.map((affiliate: any) => {
      const stat = statsMap.get(affiliate.id) || { count: 0, payoutBalance: 0, totalPaid: 0 };
      
      return {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        phone: affiliate.phone,
        referralCode: affiliate.referralCode,
        status: affiliate.status,
        enrollments: stat.count,
        payoutBalance: stat.payoutBalance,
        totalPaid: stat.totalPaid,
        acceptedTerms: affiliate.status === 'Accepted',
        joined: affiliate.joined,
      };
    });

    return NextResponse.json(enrichedAffiliates);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
