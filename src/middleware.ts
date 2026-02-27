
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
  const isApiAdminPath = path.startsWith('/api/admin');
  const isApiPartnerPath = path.startsWith('/api/partner');

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

  // Check auth for Dashboard Pages OR API Routes
  if (isAdminPath || isPartnerPath || isApiAdminPath || isApiPartnerPath) {
    if (!token) {
      if (isApiAdminPath || isApiPartnerPath) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = isAdminPath ? '/login' : '/partner/login';
      return NextResponse.redirect(new URL(loginUrl, req.url));
    }

    try {
      const { payload } = await jwtVerify(token, key);

      // Role check for Pages
      if (isAdminPath && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/login', req.url));
      }

      if (isPartnerPath && payload.role !== 'partner') {
        return NextResponse.redirect(new URL('/partner/login', req.url));
      }
      
      // Role check for API
      if (isApiAdminPath && payload.role !== 'admin') {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      // Partner API usually only for partners, but maybe admins access too? 
      // Assuming strict separation for now.
      if (isApiPartnerPath && payload.role !== 'partner') {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Inject headers for API routes
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-email', payload.email as string);
      requestHeaders.set('x-user-id', payload.id as string);
      requestHeaders.set('x-user-role', payload.role as string);
      
      // Legacy header for partner APIs (to match existing code structure if any)
      if (payload.role === 'partner') {
        requestHeaders.set('x-partner-email', payload.email as string);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

    } catch (error) {
      // Token invalid or expired
      if (isApiAdminPath || isApiPartnerPath) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
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
    '/partner/login',
    '/api/admin/:path*',
    '/api/partner/:path*'
  ],
};
