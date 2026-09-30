import { NextResponse } from 'next/server';
import { VerifyOtpSchema, SignupService } from '@/modules/auth';
import { otpRateLimiter, getClientIp, checkRateLimit } from '@/lib/rate-limiter';
import { signToken, TOKEN_COOKIE_NAME } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimitCheck = checkRateLimit(otpRateLimiter, clientIp, 'OTP verification attempts');
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response;
    }

    const rawBody = await request.json();
    const validation = VerifyOtpSchema.safeParse(rawBody);

    if (!validation.success) {
      const issues = (validation.error.issues || []) as any[];
      const errorMessage = issues.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errorMessage || 'Invalid verification request' }, { status: 400 });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const result = await SignupService.verifyOtp(validation.data, ipAddress);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Verification failed' }, { status: result.status || 400 });
    }

    // Retrieve user to sign token if player
    const user = await prisma.user.findUnique({
      where: { email: validation.data.email.toLowerCase().trim() },
      select: { id: true, name: true, email: true, role: true, status: true, avatar: true },
    });

    const response = NextResponse.json({
      success: true,
      isOwner: result.isOwner,
      pendingApproval: result.pendingApproval,
      message: result.message,
      loginUrl: result.loginUrl,
      user,
    });

    // Auto-login players upon successful phone verification
    if (user && user.role === 'USER' && user.status === 'ACTIVE') {
      const token = signToken(user as any);
      response.cookies.set({
        name: TOKEN_COOKIE_NAME,
        value: token,
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    return response;
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ error: 'Internal server error during verification' }, { status: 500 });
  }
}
