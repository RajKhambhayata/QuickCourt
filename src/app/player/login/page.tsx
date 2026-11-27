import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Player Sign In · QuickCourt',
};

export default function PlayerLoginPage() {
  return <QuickCourtApp initialPage="login" initialRole="Player" />;
}
