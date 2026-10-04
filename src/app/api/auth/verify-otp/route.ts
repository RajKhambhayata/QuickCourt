import { NextResponse } from 'next/server';
import { VerifyOtpSchema, SignupService } from '@/modules/auth';
import { otpRateLimiter, getClientIp, checkRateLimit } from '@/lib/rate-limiter';

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

    const response = NextResponse.json({
      success: true,
      isOwner: result.isOwner,
      pendingApproval: result.pendingApproval,
      message: result.message,
      loginUrl: result.loginUrl,
    });

    return response;
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ error: 'Internal server error during verification' }, { status: 500 });
  }
}
