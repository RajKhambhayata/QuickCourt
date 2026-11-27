import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Karting Championship Leaderboard · QuickCourt',
  description: 'Official racer standings, fastest laps, and championship podium points.',
};

export default function KartingChampionshipPage() {
  return <QuickCourtApp initialPage="championship" />;
}
