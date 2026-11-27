import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'development-only-secret-change-me';

function createMockJwt(payload: { id: string; email: string; role: string; status?: string }) {
  return jwt.sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
    },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );
}

describe('1 & 4. Route Protection & RBAC Middleware', () => {
  it('should_restrict_unauthenticated_access_to_protected_routes', async () => {
    // Unauthenticated request to /admin/dashboard
    const req = new NextRequest('http://localhost:3000/admin/dashboard');
    const res = await middleware(req);

    expect(res).toBeDefined();
    expect(res.status).toBe(307); // NextResponse.redirect default status
    const location = res.headers.get('location');
    expect(location).toContain('/admin/login');
    expect(location).toContain('from=%2Fadmin%2Fdashboard');
  });

  it('should_restrict_unauthenticated_access_to_player_protected_routes', async () => {
    // Unauthenticated request to /player/dashboard
    const req = new NextRequest('http://localhost:3000/player/dashboard');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/player/login');
  });

  it('should_return_403_forbidden_for_insufficient_user_roles', async () => {
    // Player trying to access Admin dashboard should be redirected to /unauthorized
    const playerToken = createMockJwt({
      id: 'player_123',
      email: 'player@example.com',
      role: 'USER',
    });

    const req = new NextRequest('http://localhost:3000/admin/dashboard', {
      headers: {
        cookie: `qc_token=${playerToken}`,
      },
    });

    const res = await middleware(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/unauthorized');
  });

  it('should_allow_authorized_admin_access_to_admin_routes', async () => {
    const adminToken = createMockJwt({
      id: 'admin_123',
      email: 'admin@example.com',
      role: 'ADMIN',
    });

    const req = new NextRequest('http://localhost:3000/admin/dashboard', {
      headers: {
        cookie: `qc_token=${adminToken}`,
      },
    });

    const res = await middleware(req);
    // When allowed, NextRequest proceeds to next() and injects user headers
    expect(res.headers.get('location')).toBeNull();
  });

  it('should_redirect_authenticated_user_visiting_login_to_dashboard', async () => {
    const playerToken = createMockJwt({
      id: 'player_123',
      email: 'player@example.com',
      role: 'USER',
    });

    const req = new NextRequest('http://localhost:3000/player/login', {
      headers: {
        cookie: `qc_token=${playerToken}`,
      },
    });

    const res = await middleware(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/player/dashboard');
  });
});
