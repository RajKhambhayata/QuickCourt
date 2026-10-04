import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Control Center · QuickCourt',
  description: 'QuickCourt platform administration panel. Restricted access.',
};

/**
 * Admin module layout.
 *
 * Intentionally does NOT render the global <Navbar /> or <Footer />.
 * The admin portal is a fully self-contained module with its own
 * sidebar navigation (AdminSidebar) rendered inside each page.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {children}
    </div>
  );
}
