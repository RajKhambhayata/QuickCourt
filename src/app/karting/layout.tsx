import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Electric Go-Karting Heats & Championship Telemetry | QuickCourt',
  description:
    'Book SODI RT8 electric kart heats, view live telemetry lap records, and compete on high-speed outdoor racing circuits.',
  openGraph: {
    title: 'Electric Go-Karting Heats & Championship Telemetry | QuickCourt',
    description:
      'Book SODI RT8 electric kart heats, view live telemetry lap records, and compete on high-speed outdoor racing circuits.',
    type: 'website',
  },
};

export default function KartingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
