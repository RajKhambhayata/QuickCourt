import { createHmac, randomInt, timingSafeEqual } from 'crypto';

const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

function otpSecret(): string {
  return process.env.OTP_SECRET || process.env.JWT_SECRET || 'quickcourt-otp-fallback-secret-2026';
}

export function createOtp(): string {
  return randomInt(100000, 1000000).toString();
}

export function hashOtp(code: string): string {
  return createHmac('sha256', otpSecret()).update(code).digest('hex');
}

export function otpMatches(code: string, storedHash: string | null): boolean {
  if (!storedHash || !/^\d{6}$/.test(code)) return false;
  const candidate = Buffer.from(hashOtp(code), 'hex');
  const stored = Buffer.from(storedHash, 'hex');
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
}

export function otpExpiry(): Date {
  return new Date(Date.now() + OTP_TTL_MS);
}

export function isOtpExpired(expiresAt: Date | null): boolean {
  return !expiresAt || expiresAt.getTime() <= Date.now();
}
