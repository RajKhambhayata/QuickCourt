import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Athlete Rewards & Turf Passes | QuickCourt',
  description:
    'Redeem QuickCourt reward coins for turf booking discounts, pro sports equipment vouchers, and partner club passes.',
  openGraph: {
    title: 'Athlete Rewards & Turf Passes | QuickCourt',
    description:
      'Redeem QuickCourt reward coins for turf booking discounts, pro sports equipment vouchers, and partner club passes.',
    type: 'website',
  },
};

export default function RewardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
