import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Club Wallet · QuickCourt',
};

export default function WalletRoutePage() {
  return <QuickCourtApp initialPage="wallet" />;
}
