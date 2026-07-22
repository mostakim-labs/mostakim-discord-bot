import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/', '/otp', '/api/auth/login', '/api/auth/verify-otp', '/api/auth/resend-otp', '/api/auth/logout'];

async function getPayload(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? '');
    const { payload } = await jwtVerify(token, secret);
    return payload as { type?: string } | null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/logo') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/offline')
  ) {
    return NextResponse.next();
  }

  // Public auth pages — redirect to dashboard if already logged in
  if (PUBLIC_PATHS.some(p => pathname === p)) {
    if (pathname === '/' || pathname === '/otp') {
      const token = req.cookies.get('auth_token')?.value;
      if (token) {
        const payload = await getPayload(token);
        if (payload?.type === 'auth') {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      }
    }
    return NextResponse.next();
  }

  // Protect /dashboard and /api/bot and /api/dashboard
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api/bot') ||
    pathname.startsWith('/api/dashboard')
  ) {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/', req.url));
    }

    const payload = await getPayload(token);
    if (!payload || payload.type !== 'auth') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const res = NextResponse.redirect(new URL('/', req.url));
      res.cookies.delete('auth_token');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
