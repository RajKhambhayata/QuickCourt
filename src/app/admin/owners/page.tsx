import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Owner Verification · QuickCourt',
};

export default function AdminOwnersPage() {
  return <QuickCourtApp initialPage="approvals" initialRole="Admin" />;
}
