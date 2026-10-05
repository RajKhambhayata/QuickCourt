import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | QuickCourt',
  description: 'Understand how QuickCourt collects, protects, and handles player and venue partner information.',
  openGraph: {
    title: 'Privacy Policy | QuickCourt',
    description: 'Understand how QuickCourt collects, protects, and handles player and venue partner information.',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface py-16">
      <div className="max-w-[800px] mx-auto px-4 md:px-6 space-y-8">
        <div className="space-y-2">
          <Link href="/" className="text-xs font-bold text-primary hover:underline">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-black tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-tertiary">Last updated: October 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6 text-sm text-on-surface-variant leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-on-surface">1. Information We Collect</h2>
            <p>
              QuickCourt collects information necessary to facilitate sports facility bookings, user authentication, and venue management. This includes your name, email address, phone number, and transaction records.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-on-surface">2. How We Use Your Information</h2>
            <p>
              Your data is used to confirm court reservations, issue instant digital QR entry passes, and provide facility owners with verified check-in schedules. We never sell your personal information to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-on-surface">3. Data Security &amp; Protection</h2>
            <p>
              We implement industry-standard encryption protocols (TLS/HTTPS) and secure hashing for credential storage. All payment tokens are handled through PCI-DSS compliant payment gateways.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
