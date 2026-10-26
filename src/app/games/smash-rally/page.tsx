import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Smash Rally Mini Game · QuickCourt',
  description: 'Tap rally game: hit the shuttlecock on time to score points and win vouchers.',
};

export default function SmashRallyPage() {
  return <QuickCourtApp initialPage="games" />;
}
