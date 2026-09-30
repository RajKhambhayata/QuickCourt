/**
 * Rate Limiter for API endpoints
 * 
 * Simple in-memory rate limiter to prevent abuse.
 * For production, consider using Redis or a dedicated rate limiting service.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    this.store.forEach((entry, key) => {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    });
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.store.set(identifier, newEntry);
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: newEntry.resetTime,
      };
    }

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  reset(identifier: string): void {
    this.store.delete(identifier);
  }
}

// Pre-configured rate limiters for different use cases
export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 5); // 5 requests per 15 minutes
export const otpRateLimiter = new RateLimiter(15 * 60 * 1000, 3); // 3 OTP requests per 15 minutes
export const generalRateLimiter = new RateLimiter(60 * 1000, 20); // 20 requests per minute
export const writeRateLimiter = new RateLimiter(60 * 1000, 10); // 10 write requests per minute

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  // Try various headers that might contain the real IP
  const headers = request.headers;
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip');

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to a generic identifier
  return 'unknown';
}

/**
 * Check rate limit and return error response if exceeded
 */
export function checkRateLimit(
  limiter: RateLimiter,
  identifier: string,
  context: string = 'Request'
): { allowed: boolean; response?: Response } {
  const result = limiter.check(identifier);

  if (!result.allowed) {
    const response = new Response(
      JSON.stringify({
        error: `Too many ${context.toLowerCase()}. Please try again later.`,
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
    return { allowed: false, response };
  }

  return { allowed: true };
}