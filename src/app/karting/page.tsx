import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Go-Karting Heats & Track Sessions · QuickCourt',
  description: 'Book racing heats, cadet & pro karts, and test your lap times on professional tracks.',
};

export default function KartingPage() {
  return <QuickCourtApp initialPage="karting" />;
}
