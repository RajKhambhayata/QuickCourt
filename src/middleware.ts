import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TOKEN_COOKIE_NAME, verifyToken } from '@/lib/auth';

// Protected route configurations with required roles
const PROTECTED_ROUTES: { pattern: RegExp; role?: 'ADMIN' | 'OWNER' | 'USER'; loginPortal: string }[] = [
  { pattern: /^\/admin\/(dashboard|facilities|owners|reports|users|audit-logs)(\/|$)/, role: 'ADMIN', loginPortal: '/admin/login' },
  { pattern: /^\/owner\/(dashboard|facilities|facility|courts|bookings|slots|analytics)(\/|$)/, role: 'OWNER', loginPortal: '/owner/login' },
  { pattern: /^\/profile(\/|$)/, loginPortal: '/player/login' },
  { pattern: /^\/my-bookings(\/|$)/, loginPortal: '/player/login' },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // RULE: Admin never self-signups. Block /admin/signup and redirect to admin login with explanation
  if (pathname === '/admin/signup') {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('notice', 'Admin accounts cannot be self-registered. They are created via system seed script or administrative invite only.');
    return NextResponse.redirect(loginUrl);
  }

  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

  // Verify route protection
  for (const route of PROTECTED_ROUTES) {
    if (route.pattern.test(pathname)) {
      if (!token) {
        return redirectToLogin(request, route.loginPortal, pathname);
      }

      // Stage 1: Verify JWT token
      const decoded = verifyToken(token);
      if (!decoded) {
        const response = redirectToLogin(request, route.loginPortal, pathname);
        response.cookies.delete(TOKEN_COOKIE_NAME);
        return response;
      }

      // Stage 2: Block wrong role by route path
      if (route.role) {
        if (route.role === 'ADMIN' && decoded.role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        if (route.role === 'OWNER' && decoded.role !== 'OWNER' && decoded.role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }

      // Forward user context headers for fast edge reads
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.id);
      requestHeaders.set('x-user-role', decoded.role);
      requestHeaders.set('x-user-email', decoded.email);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest, portalUrl: string, pathname: string) {
  const loginUrl = new URL(portalUrl, request.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/owner/:path*',
    '/profile/:path*',
    '/my-bookings/:path*',
  ],
};
