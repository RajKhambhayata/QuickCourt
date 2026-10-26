import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Owner Verification Pending · QuickCourt',
};

export default function OwnerPendingPage() {
  return <QuickCourtApp initialPage="owner" initialRole="Owner" />;
}
