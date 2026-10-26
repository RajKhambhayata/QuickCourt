import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Daily Spin Wheel · QuickCourt',
  description: 'Spin the wheel every 24 hours to win Court Coins, court booking discounts, and food coupons.',
};

export default function SpinPage() {
  return <QuickCourtApp initialPage="games" />;
}
