import { describe, expect, it } from 'vitest';
import { CreateBookingSchema, isBookableDate } from '@/modules/core/booking/booking.schema';

describe('booking date validation', () => {
  const today = new Date('2026-11-21T12:00:00.000Z');

  it('allows today and future dates', () => {
    expect(isBookableDate('2026-11-21', today)).toBe(true);
    expect(isBookableDate('2026-11-22', today)).toBe(true);
  });

  it('rejects past and impossible calendar dates', () => {
    expect(isBookableDate('2026-11-20', today)).toBe(false);
    expect(isBookableDate('2026-02-30', today)).toBe(false);
  });

  it('rejects a past date through the booking request schema', () => {
    const result = CreateBookingSchema.safeParse({
      courtId: 'test-court', date: '2026-11-20', startTime: '10:00', endTime: '11:00',
    });
    expect(result.success).toBe(false);
  });
});
