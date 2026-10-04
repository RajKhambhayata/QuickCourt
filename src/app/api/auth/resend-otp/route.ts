import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createOtp, hashOtp, otpExpiry, OTP_RESEND_COOLDOWN_MS } from '@/lib/otp';
import { sendVerificationSms } from '@/lib/sms';
import { otpRateLimiter, getClientIp, checkRateLimit } from '@/lib/rate-limiter';

export async function POST(request: Request) {
  try {
    // Rate limiting check
    const clientIp = getClientIp(request);
    const rateLimitCheck = checkRateLimit(otpRateLimiter, clientIp, 'OTP resend attempts');
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response;
    }

    const { email } = await request.json();
    if (typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    // Do not reveal whether an address is registered.
    if (!user || user.isVerified || !user.phone) {
      return NextResponse.json({ success: true, message: 'If the account needs verification, a code has been sent.' });
    }
    if (user.otpLastSentAt && Date.now() - user.otpLastSentAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
      return NextResponse.json({ error: 'Please wait one minute before requesting another code.' }, { status: 429 });
    }

    return NextResponse.json({ success: true, message: 'OTP verification is currently disabled. You can log in directly.' });
  } catch (error) {
    console.error('OTP resend error:', error);
    return NextResponse.json({ error: 'We could not send a verification SMS. Please try again later.' }, { status: 503 });
  }
}
