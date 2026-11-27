import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Player Dashboard · QuickCourt',
};

export default function PlayerDashboardPage() {
  return <QuickCourtApp initialPage="bookings" initialRole="Player" />;
}
