import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | QuickCourt',
  description: 'Review the terms, conditions, cancellation rules, and venue ground policies for booking on QuickCourt.',
  openGraph: {
    title: 'Terms of Service | QuickCourt',
    description: 'Review the terms, conditions, cancellation rules, and venue ground policies for booking on QuickCourt.',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-on-surface py-16">
      <div className="max-w-[800px] mx-auto px-4 md:px-6 space-y-8">
        <div className="space-y-2">
          <Link href="/" className="text-xs font-bold text-primary hover:underline">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-black tracking-tight">Terms of Service</h1>
          <p className="text-xs text-tertiary">Last updated: October 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6 text-sm text-on-surface-variant leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-on-surface">1. Acceptance of Terms</h2>
            <p>
              By accessing QuickCourt or booking any sports facility through our web application, you agree to comply with these terms, venue ground rules, and safety regulations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-on-surface">2. Booking Cancellations &amp; Refunds</h2>
            <p>
              Cancellations made more than 4 hours before the booked slot are eligible for full wallet credit or refund as per the respective facility partner policy. No-shows are non-refundable.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-on-surface">3. Facility Ground Etiquette</h2>
            <p>
              Players are required to wear non-marking shoes on synthetic and wooden badminton/squash courts. Proper athletic gear is mandatory across all listed venues.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
