import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'My Bookings · QuickCourt',
};

export default function MyBookingsPage() {
  return <QuickCourtApp initialPage="bookings" />;
}
