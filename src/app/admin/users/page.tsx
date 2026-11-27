import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Platform Users · QuickCourt',
};

export default function AdminUsersPage() {
  return <QuickCourtApp initialPage="admin" initialRole="Admin" />;
}
