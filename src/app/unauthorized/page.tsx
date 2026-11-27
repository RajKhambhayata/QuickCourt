'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, ArrowRight } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex items-center justify-center p-4">
      <div className="max-w-md w-full border rule bg-[#f3eedf] p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full border border-[#173d2b] flex items-center justify-center mx-auto text-[#173d2b]">
          <ShieldAlert size={28} />
        </div>

        <div className="space-y-2">
          <div className="eyebrow text-[#71856a]">Restricted Access</div>
          <h1 className="display text-3xl font-semibold">Club Desk Notice</h1>
          <p className="text-xs text-[#687468] leading-relaxed">
            You do not have credentials for this sector of the club. Please sign in with an authorized account or return to the main grounds.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => router.back()}
            className="quiet px-4 py-2.5 text-xs flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={14} />
            Go back
          </button>
          <Link
            href="/"
            className="btn px-4 py-2.5 text-xs flex items-center justify-center gap-1.5"
          >
            Return to club grounds <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
