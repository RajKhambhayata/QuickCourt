import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_COOKIE_NAME = 'qc_token';
const JWT_SECRET = process.env.JWT_SECRET || 'development-only-secret-change-me';

type EdgeToken = { id: string; email: string; role: string; status?: string };

async function verifyEdgeToken(token: string): Promise<EdgeToken | null> {
  try {
    const [headerPart, payloadPart, signaturePart] = token.split('.');
    if (!headerPart || !payloadPart || !signaturePart) return null;
    const decode = (value: string) =>
      Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
    const header = JSON.parse(new TextDecoder().decode(decode(headerPart)));
    const payload = JSON.parse(new TextDecoder().decode(decode(payloadPart)));
    if (header.alg !== 'HS256' || typeof payload.exp !== 'number' || payload.exp <= Date.now() / 1000) return null;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      decode(signaturePart),
      new TextEncoder().encode(`${headerPart}.${payloadPart}`)
    );
    if (!valid || typeof payload.id !== 'string' || typeof payload.email !== 'string' || typeof payload.role !== 'string') return null;
    return { id: payload.id, email: payload.email, role: payload.role, status: payload.status };
  } catch {
    return null;
  }
}

// Portal route configurations with required roles
const PORTALS = [
  { prefix: '/admin', role: 'ADMIN', loginPortal: '/admin/login', dashboard: '/admin/dashboard' },
  { prefix: '/owner', role: 'OWNER', loginPortal: '/owner/login', dashboard: '/owner/dashboard' },
  { prefix: '/player', role: 'USER', loginPortal: '/player/login', dashboard: '/player/dashboard' },
  { prefix: '/user', role: 'USER', loginPortal: '/player/login', dashboard: '/player/dashboard' },
] as const;

// Portal login/signup pages are public — no auth required to *view* them
// But authenticated users should be redirected away or shown a notice
const PUBLIC_PORTAL_SUFFIXES = ['/login', '/signup', '/register'];

/** Returns the portal this pathname belongs to, if any */
function findPortal(pathname: string) {
  return PORTALS.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** The dashboard URL for a given role */
function dashboardFor(role: string): string {
  const portal = PORTALS.find((p) => p.role === role);
  return portal?.dashboard ?? '/';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const portal = findPortal(pathname);

  // Bare portal root redirect (e.g. /owner → /owner/dashboard)
  if (portal && (pathname === portal.prefix || pathname === `${portal.prefix}/`)) {
    return NextResponse.redirect(new URL(portal.dashboard, request.url));
  }

  const isPublicPortalPage =
    portal !== undefined && PUBLIC_PORTAL_SUFFIXES.includes(pathname.slice(portal.prefix.length));

  // Verify JWT from cookie
  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;
  const decoded = token ? await verifyEdgeToken(token) : null;

  if (decoded) {
    // ── Authenticated user ──────────────────────────────────────────────────
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.id);
    requestHeaders.set('x-user-role', decoded.role);
    requestHeaders.set('x-user-email', decoded.email);
    if (decoded.status) requestHeaders.set('x-user-status', decoded.status);

    if (portal && isPublicPortalPage) {
      // User is signed in and visiting their CURRENT portal's login/signup page:
      if (decoded.role === portal.role) {
        // Same portal: redirect to their own dashboard.
        const dest = decoded.role === 'OWNER' && decoded.status === 'PENDING_APPROVAL'
          ? '/owner/pending'
          : portal.dashboard;
        return NextResponse.redirect(new URL(dest, request.url));
      }
      // If visiting a different portal's login/signup page (e.g. USER visiting /owner/login),
      // allow them to proceed so they can log in with an account matching that portal.
    }

    if (portal && !isPublicPortalPage) {
      // Protected portal page: enforce role match (ADMIN can access all portals)
      if (decoded.role !== portal.role && decoded.role !== 'ADMIN') {
        // Wrong role — redirect to unauthorized
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      // OWNER with PENDING_APPROVAL may only visit /owner/pending and /owner/dashboard
      if (
        portal.role === 'OWNER' &&
        decoded.status === 'PENDING_APPROVAL' &&
        !['/owner/dashboard', '/owner/pending'].some((p) => pathname === p || pathname.startsWith(p + '/'))
      ) {
        return NextResponse.redirect(new URL('/owner/pending', request.url));
      }
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ── Unauthenticated user ────────────────────────────────────────────────
  // Redirect to the correct portal login if they try to access a protected route
  if (portal && !isPublicPortalPage) {
    return redirectToLogin(request, portal.loginPortal, pathname);
  }
  if (!portal && (pathname.startsWith('/profile') || pathname.startsWith('/my-bookings'))) {
    return redirectToLogin(request, '/player/login', pathname);
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
    '/player/:path*',
    '/user/:path*',
    '/profile/:path*',
    '/my-bookings/:path*',
  ],
};
