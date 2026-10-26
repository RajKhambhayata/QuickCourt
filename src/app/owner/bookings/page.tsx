import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Owner Bookings · QuickCourt',
};

export default function OwnerBookingsPage() {
  return <QuickCourtApp initialPage="bookings" initialRole="Owner" />;
}
