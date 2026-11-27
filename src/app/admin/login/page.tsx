import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Admin Sign In · QuickCourt',
};

export default function AdminLoginPage() {
  return <QuickCourtApp initialPage="login" initialRole="Admin" />;
}
