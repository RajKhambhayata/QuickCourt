'use client';

import { useState, useEffect } from 'react';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'OWNER' | 'ADMIN';
  avatar?: string | null;
  phone?: string | null;
  status: string;
  isVerified: boolean;
  bookingsCount?: number;
}

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}

/**
 * Returns true only if the user is logged in AND has one of the allowed roles.
 */
export function requireRole(
  user: UserSession | null,
  allowedRoles: ('USER' | 'OWNER' | 'ADMIN')[],
): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Returns the redirect URL if the user does NOT have an allowed role, otherwise null.
 */
export function redirectIfWrongRole(
  user: UserSession | null,
  allowedRoles: ('USER' | 'OWNER' | 'ADMIN')[],
  redirectUrl: string,
): string | null {
  if (!user || !allowedRoles.includes(user.role)) return redirectUrl;
  return null;
}
