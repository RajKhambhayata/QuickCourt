import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Owner Portal · QuickCourt',
  description: 'QuickCourt facility owner portal — manage courts, bookings and analytics.',
};

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
