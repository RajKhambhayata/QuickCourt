import { revalidateTag } from 'next/cache';

/**
 * Cache tags for Next.js unstable_cache
 */
export const CACHE_TAGS = {
  VENUES: 'venues',
  VENUE_DETAIL: (id: string) => `venue-${id}`,
  AVAILABILITY: 'availability',
  ADMIN_STATS: 'admin-stats',
  OWNER_STATS: (ownerId: string) => `owner-stats-${ownerId}`,
  BOOKINGS: 'bookings',
  USER_BOOKINGS: (userId: string) => `user-bookings-${userId}`,
} as const;

/**
 * Revalidate cache for venues
 */
export function revalidateVenues() {
  revalidateTag(CACHE_TAGS.VENUES);
}

/**
 * Revalidate cache for a specific venue
 */
export function revalidateVenue(venueId: string) {
  revalidateTag(CACHE_TAGS.VENUE_DETAIL(venueId));
  revalidateTag(CACHE_TAGS.VENUES); // Also revalidate list
}

/**
 * Revalidate cache for availability/slots
 */
export function revalidateAvailability() {
  revalidateTag(CACHE_TAGS.AVAILABILITY);
}

/**
 * Revalidate cache for admin stats
 */
export function revalidateAdminStats() {
  revalidateTag(CACHE_TAGS.ADMIN_STATS);
}

/**
 * Revalidate cache for owner stats
 */
export function revalidateOwnerStats(ownerId: string) {
  revalidateTag(CACHE_TAGS.OWNER_STATS(ownerId));
}

/**
 * Revalidate cache for bookings
 */
export function revalidateBookings() {
  revalidateTag(CACHE_TAGS.BOOKINGS);
}

/**
 * Revalidate cache for user bookings
 */
export function revalidateUserBookings(userId: string) {
  revalidateTag(CACHE_TAGS.USER_BOOKINGS(userId));
}
