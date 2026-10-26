import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Facility Editor · QuickCourt',
};

export default function OwnerFacilityPage() {
  return <QuickCourtApp initialPage="facility" initialRole="Owner" />;
}
