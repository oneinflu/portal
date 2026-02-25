
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import Affiliate from '@/models/Affiliate';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email, password, type } = await req.json();

    if (!email || !password || !type) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    let user;
    let role;

    if (type === 'admin') {
      user = await Admin.findOne({ email });
      role = 'admin';
    } else if (type === 'partner') {
      user = await Affiliate.findOne({ email });
      role = 'partner';
    } else {
      return NextResponse.json({ error: 'Invalid login type' }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash || '');
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate Token
    const token = await signToken({ 
      id: user._id, 
      email: user.email, 
      role,
      name: role === 'partner' ? (user as any).name : 'Admin'
    });

    const response = NextResponse.json({ success: true, role });
    
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
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
