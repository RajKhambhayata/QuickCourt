import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function AdminSignupPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 flex items-center justify-center text-slate-100">
      <section className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">
        <ShieldCheck className="mx-auto mb-5 h-12 w-12 text-purple-400" />
        <h1 className="text-2xl font-bold">Administrator accounts are provisioned</h1>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          Public administrator registration is disabled. Contact your platform operator to provision an administrator account.
        </p>
        <Link href="/admin/login" className="mt-8 inline-flex rounded-xl bg-purple-700 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-600">
          Return to admin sign in
        </Link>
      </section>
    </main>
  );
}
