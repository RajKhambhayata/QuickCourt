import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-bold text-on-surface mb-2">Page Not Found</h2>
      <p className="text-tertiary max-w-md mb-8">
        The court or page you are looking for does not exist or has been relocated.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-lg bg-primary text-on-primary font-bold shadow-md hover:bg-primary/90 transition-colors"
      >
        Return to Homepage
      </Link>
    </div>
  );
}
