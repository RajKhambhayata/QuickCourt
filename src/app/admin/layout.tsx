import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Control Center · QuickCourt',
  description: 'QuickCourt platform administration panel.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
