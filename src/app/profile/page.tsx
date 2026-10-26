import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'My Profile · QuickCourt',
};

export default function ProfilePage() {
  return <QuickCourtApp initialPage="profile" />;
}
