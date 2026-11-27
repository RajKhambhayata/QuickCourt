import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Owner Sign Up · QuickCourt',
};

export default function OwnerSignupPage() {
  return <QuickCourtApp initialPage="signup" initialRole="Owner" />;
}
