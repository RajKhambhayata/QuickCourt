import React from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col items-center justify-center px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#173d2b] mb-4">
        <Trophy size={22} />
      </div>
      <div className="eyebrow mb-2 text-[#71856a]">Notice · Error 404</div>
      <h1 className="display text-6xl md:text-8xl mb-3">Outside the lines.</h1>
      <p className="text-sm text-[#687468] max-w-md mb-8">
        The court or page you are looking for does not exist or has been relocated.
      </p>
      <Link
        href="/"
        className="btn px-6 py-3 text-xs flex items-center gap-2"
      >
        Return to club grounds <ArrowRight size={14} />
      </Link>
    </div>
  );
}
