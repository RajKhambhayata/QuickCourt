import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Admin Sign Up · QuickCourt',
};

export default function AdminSignupPage() {
  return <QuickCourtApp initialPage="signup" initialRole="Admin" />;
}
