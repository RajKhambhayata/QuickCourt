import {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  getCurrentUser,
  TOKEN_COOKIE_NAME,
} from '@/lib/auth';
import { createOtp, hashOtp, otpMatches, otpExpiry } from '@/lib/otp';
import { normalizePhoneNumber } from '@/lib/phone';
import { sendVerificationSms, isSmsConfigured } from '@/lib/sms';

export const AuthService = {
  // Passwords
  hashPassword,
  comparePassword,

  // JWT & Sessions
  signToken,
  verifyToken,
  getCurrentUser,
  TOKEN_COOKIE_NAME,

  // Phone & OTP
  normalizePhoneNumber,
  createOtp,
  hashOtp,
  otpMatches,
  otpExpiry,
  sendVerificationSms,
  isSmsConfigured,
};

export * from '@/lib/auth';
export * from '@/lib/otp';
export * from '@/lib/phone';
export * from '@/lib/sms';
