import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Player Sign Up · QuickCourt',
};

export default function PlayerSignupPage() {
  return <QuickCourtApp initialPage="signup" initialRole="Player" />;
}
