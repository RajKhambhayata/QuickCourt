import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'QuickCourt — Find your next game',
  description: 'Book the court. Bring the game. A better way to find sports facilities.',
};

export default function HomePage() {
  return <QuickCourtApp initialPage="home" />;
}
