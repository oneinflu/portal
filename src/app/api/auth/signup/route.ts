
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Affiliate from '@/models/Affiliate';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import crypto from 'crypto';

function generateReferralCode(name: string) {
  // Simple referral code generation: First 3 letters of name (uppercase) + 4 random hex chars
  const prefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PAR');
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}${random}`;
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { name, email, phone, location, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await Affiliate.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate unique referral code
    let referralCode = generateReferralCode(name);
    let isUnique = false;
    while (!isUnique) {
      const existingCode = await Affiliate.findOne({ referralCode });
      if (!existingCode) {
        isUnique = true;
      } else {
        referralCode = generateReferralCode(name);
      }
    }

    // Create Affiliate
    const affiliate = await Affiliate.create({
      name,
      email,
      phone: phone || '',
      passwordHash,
      referralCode,
      status: 'Pending', // Or 'Accepted' if you want auto-approval
      // location is not in the model, maybe add it or ignore it?
      // The current model doesn't have location. I'll ignore it for now or add it to the model.
      // Given the user didn't ask for location in model, I'll ignore it but maybe store it if I modify schema.
      // For now, let's stick to existing schema.
    });

    // Generate Token
    const token = await signToken({ 
      id: affiliate._id, 
      email: affiliate.email, 
      role: 'partner',
      name: affiliate.name
    });

    const response = NextResponse.json({ success: true, message: "Account created successfully" });
    
    // Set Cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
