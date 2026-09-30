import { UserSession } from '@/lib/types';

export const PORTAL_ROUTES = {
  PLAYER: {
    base: '/player',
    home: '/venues',
    login: '/player/login',
    signup: '/player/signup',
    guardedRoutes: ['/my-bookings', '/profile'],
  },
  OWNER: {
    base: '/owner',
    home: '/owner/dashboard',
    login: '/owner/login',
    signup: '/owner/signup',
    guardedRoutes: ['/owner/dashboard', '/owner/facilities', '/owner/courts', '/owner/bookings', '/owner/slots'],
  },
  ADMIN: {
    base: '/admin',
    home: '/admin/dashboard',
    login: '/admin/login',
    signup: '/admin/signup', // Note: Public self-signup disabled; managed via seed/invite only
    guardedRoutes: ['/admin/dashboard', '/admin/facilities', '/admin/owners', '/admin/reports', '/admin/users', '/admin/audit-logs'],
  },
};

export function canAccessPortal(user: UserSession | null, portal: 'PLAYER' | 'OWNER' | 'ADMIN'): { allowed: boolean; redirectUrl?: string } {
  if (!user) {
    return { allowed: false, redirectUrl: PORTAL_ROUTES[portal].login };
  }

  if (portal === 'ADMIN' && user.role !== 'ADMIN') {
    return { allowed: false, redirectUrl: '/unauthorized' };
  }

  if (portal === 'OWNER' && user.role !== 'OWNER' && user.role !== 'ADMIN') {
    return { allowed: false, redirectUrl: '/unauthorized' };
  }

  return { allowed: true };
}
