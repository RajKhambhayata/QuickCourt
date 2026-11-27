import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Sports Food Court & Outlets · QuickCourt',
  description: 'Healthy cafes, protein bars, and food stalls at verified sports arenas.',
};

export default function FoodCourtPage() {
  return <QuickCourtApp initialPage="food-court" />;
}
