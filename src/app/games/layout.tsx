import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sports Mini-Games, Spin Wheel & Daily Streaks | QuickCourt',
  description:
    'Play sports trivia, scratch cards, and daily spin wheels to win instant booking discounts and reward coins on QuickCourt.',
  openGraph: {
    title: 'Sports Mini-Games, Spin Wheel & Daily Streaks | QuickCourt',
    description:
      'Play sports trivia, scratch cards, and daily spin wheels to win instant booking discounts and reward coins on QuickCourt.',
    type: 'website',
  },
};

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
