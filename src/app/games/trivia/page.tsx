import React from 'react';
import QuickCourtApp from '@/components/QuickCourtApp';

export const metadata = {
  title: 'Sports Trivia Challenge · QuickCourt',
  description: 'Answer sports trivia questions to earn Court Coins for your wallet.',
};

export default function TriviaPage() {
  return <QuickCourtApp initialPage="games" />;
}
