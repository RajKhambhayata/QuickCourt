import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Player Portal · QuickCourt',
  description: 'Sign in or register to discover venues and book sports courts on QuickCourt.',
};

/**
 * Player module layout.
 *
 * The player auth pages (/player/login, /player/signup) are part of the
 * public-facing consumer app, so they intentionally inherit the shared
 * root layout which includes <Navbar /> and <Footer />.
 *
 * This layout exists to:
 *  - Provide player-specific metadata
 *  - Act as the structural boundary for the player module
 */
export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
