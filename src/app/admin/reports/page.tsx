import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Platform Reports · QuickCourt',
};

export default function AdminReportsPage() {
  return <QuickCourtApp initialPage="admin" initialRole="Admin" />;
}
