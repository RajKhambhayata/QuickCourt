import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export default function SingleVenuePage({
  params,
}: {
  params: { id: string };
}) {
  return <QuickCourtApp initialPage="detail" initialVenueId={params.id} />;
}
