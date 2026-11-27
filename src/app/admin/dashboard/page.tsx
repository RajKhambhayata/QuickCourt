import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Admin Platform Overview · QuickCourt',
};

export default function AdminDashboardPage() {
  return <QuickCourtApp initialPage="admin" initialRole="Admin" />;
}
