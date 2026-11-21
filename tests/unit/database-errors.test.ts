import { describe, expect, it } from 'vitest';
import { isDatabaseUnavailable } from '@/lib/database-errors';

describe('database connectivity error detection', () => {
  it('recognizes Prisma P1001 initialization errors', () => {
    expect(isDatabaseUnavailable({ code: 'P1001' })).toBe(true);
    expect(isDatabaseUnavailable(new Error("Can't reach database server (P1001)"))).toBe(true);
  });

  it('does not classify unrelated failures as database outages', () => {
    expect(isDatabaseUnavailable(new Error('Invalid email or password'))).toBe(false);
    expect(isDatabaseUnavailable(null)).toBe(false);
  });
});
