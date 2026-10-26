import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Owner Dashboard · QuickCourt',
};

export default function OwnerDashboardPage() {
  return <QuickCourtApp initialPage="owner" initialRole="Owner" />;
}
