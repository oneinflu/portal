
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key-at-least-32-chars-long';
const key = new TextEncoder().encode(SECRET_KEY);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const path = req.nextUrl.pathname;

  // Paths that require authentication
  const isAdminPath = path.startsWith('/dashboard');
  const isPartnerPath = path.startsWith('/partner/dashboard');
  const isLoginPath = path === '/login' || path === '/partner/login';

  if (isLoginPath) {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, key);
        if (payload.role === 'admin') {
           return NextResponse.redirect(new URL('/dashboard', req.url));
        } else if (payload.role === 'partner') {
           return NextResponse.redirect(new URL('/partner/dashboard', req.url));
        }
      } catch (e) {
        // Invalid token, proceed to login
      }
    }
    return NextResponse.next();
  }

  if (isAdminPath || isPartnerPath) {
    if (!token) {
      const loginUrl = isAdminPath ? '/login' : '/partner/login';
      return NextResponse.redirect(new URL(loginUrl, req.url));
    }

    try {
      const { payload } = await jwtVerify(token, key);

      if (isAdminPath && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/login', req.url));
      }

      if (isPartnerPath && payload.role !== 'partner') {
        return NextResponse.redirect(new URL('/partner/login', req.url));
      }

      return NextResponse.next();

    } catch (error) {
      // Token invalid or expired
      const loginUrl = isAdminPath ? '/login' : '/partner/login';
      return NextResponse.redirect(new URL(loginUrl, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/partner/dashboard/:path*',
    '/login',
    '/partner/login'
  ],
};
