import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Court Checkout · QuickCourt',
};

export default function CheckoutRoutePage() {
  return <QuickCourtApp initialPage="checkout" />;
}
