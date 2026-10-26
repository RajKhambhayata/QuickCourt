import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/login/route';
import { LoginService } from '@/modules/auth';

vi.mock('@/modules/auth', async () => {
  const actual = await vi.importActual<any>('@/modules/auth');
  return {
    ...actual,
    LoginService: {
      authenticate: vi.fn(),
    },
  };
});

describe('1. Authentication & User Management - API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should_allow_valid_user_login', async () => {
    (LoginService.authenticate as any).mockResolvedValueOnce({
      success: true,
      user: {
        id: 'usr_123',
        name: 'Player One',
        email: 'player@example.com',
        role: 'USER',
      },
      cookieOptions: {
        name: 'qc_token',
        value: 'mock_jwt_token',
        httpOnly: true,
        path: '/',
        maxAge: 604800,
        sameSite: 'lax',
        secure: false,
      },
    });

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'player@example.com',
        password: 'ValidPassword123!',
        portalRole: 'USER',
      }),
    });

    const response = (await POST(request))!;
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.user.email).toBe('player@example.com');
    expect((response as any).cookies.get('qc_token')?.value).toBe('mock_jwt_token');
  });

  it('should_reject_invalid_password', async () => {
    (LoginService.authenticate as any).mockResolvedValueOnce({
      success: false,
      status: 401,
      error: 'Invalid email or password',
    });

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'player@example.com',
        password: 'WrongPassword!',
        portalRole: 'USER',
      }),
    });

    const response = (await POST(request))!;
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Invalid email or password');
  });

  it('should_show_error_for_unregistered_email', async () => {
    (LoginService.authenticate as any).mockResolvedValueOnce({
      success: false,
      status: 401,
      error: 'No account found with this email address',
    });

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'unknown@example.com',
        password: 'Password123!',
        portalRole: 'USER',
      }),
    });

    const response = (await POST(request))!;
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toContain('No account found');
  });

  it('should_prevent_submission_when_required_fields_are_empty', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: '',
        password: '',
        portalRole: 'USER',
      }),
    });

    const response = (await POST(request))!;
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('Please enter a valid email address');
  });
});
