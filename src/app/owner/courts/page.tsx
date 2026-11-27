import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Courts & Hours · QuickCourt',
};

export default function OwnerCourtsPage() {
  return <QuickCourtApp initialPage="courts" initialRole="Owner" />;
}
