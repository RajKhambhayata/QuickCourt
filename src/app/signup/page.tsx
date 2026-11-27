import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Join the Club · QuickCourt',
};

export default function SignupPage() {
  return <QuickCourtApp initialPage="signup" />;
}
