import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Court Slots · QuickCourt',
};

export default function OwnerSlotsPage() {
  return <QuickCourtApp initialPage="courts" initialRole="Owner" />;
}
