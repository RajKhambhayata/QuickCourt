import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Owner Portal · QuickCourt',
  description: 'QuickCourt facility owner portal — manage courts, bookings and analytics.',
};

/**
 * Owner module layout.
 *
 * Intentionally does NOT render the global <Navbar /> or <Footer />.
 * The owner portal is a fully self-contained module with its own
 * sidebar navigation (OwnerSidebar) rendered inside each page.
 */
export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {children}
    </div>
  );
}
