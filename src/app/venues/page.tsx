import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Venues Directory · QuickCourt',
  description: 'Find verified courts and sports turf grounds near you.',
};

export default function VenuesPage() {
  return <QuickCourtApp initialPage="venues" />;
}
