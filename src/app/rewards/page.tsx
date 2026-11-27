import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Club Rewards & Quests · QuickCourt',
  description: 'Track daily streaks, earn Court Coins, and unlock partner discounts and vouchers.',
};

export default function RewardsPage() {
  return <QuickCourtApp initialPage="rewards" />;
}
