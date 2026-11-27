import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Scratch & Win · QuickCourt',
  description: 'Scratch to reveal secret promo codes, discounts, and tournament passes.',
};

export default function ScratchPage() {
  return <QuickCourtApp initialPage="games" />;
}
