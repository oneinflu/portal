
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Affiliate from '@/models/Affiliate';
import Enrollment from '@/models/Enrollment';
import Transaction from '@/models/Transaction';
import Referral from '@/models/Referral';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';

export async function GET() {
  await dbConnect();

  try {
    // Clear existing data
    await Affiliate.deleteMany({});
    await Enrollment.deleteMany({});
    await Transaction.deleteMany({});
    await Referral.deleteMany({});
    await Admin.deleteMany({});

    // Create Admin
    const passwordHash = await bcrypt.hash('Incorrect2018', 10);
    await Admin.create({
      email: 'admin@skillstrideacademy.com',
      passwordHash,
    });

    return NextResponse.json({ success: true, message: "Database cleared and admin user created successfully" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
