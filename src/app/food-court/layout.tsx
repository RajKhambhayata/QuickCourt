import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sports Food Court & Athlete Recovery Hub | QuickCourt',
  description:
    'Order athlete recovery nutrition, smoothies, high-protein meals, and beverages at sports arena food courts on QuickCourt.',
  openGraph: {
    title: 'Sports Food Court & Athlete Recovery Hub | QuickCourt',
    description:
      'Order athlete recovery nutrition, smoothies, high-protein meals, and beverages at sports arena food courts on QuickCourt.',
    type: 'website',
  },
};

export default function FoodCourtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
