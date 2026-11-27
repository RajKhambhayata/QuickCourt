import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Sign In · QuickCourt',
};

export default function LoginPage() {
  return <QuickCourtApp initialPage="login" />;
}
