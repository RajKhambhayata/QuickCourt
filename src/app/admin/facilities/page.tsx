import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Facility Verification Queue · QuickCourt',
};

export default function AdminFacilitiesPage() {
  return <QuickCourtApp initialPage="approvals" initialRole="Admin" />;
}
