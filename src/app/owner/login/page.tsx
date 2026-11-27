import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Owner Sign In · QuickCourt',
};

export default function OwnerLoginPage() {
  return <QuickCourtApp initialPage="login" initialRole="Owner" />;
}
