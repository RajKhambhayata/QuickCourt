import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Arcade & Mini Games · QuickCourt',
  description: 'Play Smash Rally, Daily Spin, Scratch & Win, and Sports Trivia to earn Court Coins and food vouchers.',
};

export default function GamesPage() {
  return <QuickCourtApp initialPage="games" />;
}
