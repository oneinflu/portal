/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Affiliate from '@/models/Affiliate';

export async function GET() {
  await dbConnect();
  try {
    const enrollments = await Enrollment.find().populate('partnerId').sort({ joined: -1 });

    const enrichedEnrollments = enrollments.map((enrollment: any) => {
      const affiliate = enrollment.partnerId;
      
      return {
        id: enrollment.id,
        affiliateName: affiliate ? affiliate.name : 'Unknown',
        affiliateId: affiliate ? affiliate.id : enrollment.partnerId,
        studentName: enrollment.name,
        course: enrollment.course,
        package: enrollment.package,
        plan: enrollment.plan,
        amountPaid: enrollment.paidAmount,
        commissionRate: enrollment.commissionRate,
        payoutAmount: enrollment.commission,
        netRevenue: enrollment.paidAmount - enrollment.commission,
        isPaidToAffiliate: enrollment.payoutStatus === 'Paid',
        enrollmentDate: enrollment.joined,
      };
    });

    return NextResponse.json(enrichedEnrollments);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
