'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Renders the global Navbar and Footer only on non-portal pages.
 * The /owner, /admin, and /player portals are self-contained and
 * use their own sidebar navigation — they intentionally exclude the
 * global nav to avoid UI conflicts and role confusion.
 */
const PORTAL_PREFIXES = ['/owner', '/admin', '/player'];

export default function PortalAwareShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortal = PORTAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <>
      {!isPortal && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isPortal && <Footer />}
    </>
  );
}
