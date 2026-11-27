import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Player Portal · QuickCourt',
  description: 'Sign in or register to discover venues and book sports courts on QuickCourt.',
};

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
