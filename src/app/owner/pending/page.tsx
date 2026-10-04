export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Clock, Building2, CheckCircle2, XCircle, LogOut } from 'lucide-react';

export const metadata = {
  title: 'Application Pending · Owner Portal · QuickCourt',
};

export default async function OwnerPendingPage() {
  const user = await getCurrentUser();

  // Not logged in → back to login
  if (!user) redirect('/owner/login');
  // Approved or active → let them into dashboard
  if (user.role === 'OWNER' && user.status === 'ACTIVE') redirect('/owner/dashboard');
  // Not an owner → unauthorized
  if (user.role !== 'OWNER') redirect('/unauthorized');

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30">
          <Clock className="w-10 h-10 text-white" />
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-slate-900">Application Under Review</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Hi <span className="font-bold text-slate-700">{user.name}</span>, your Facility Owner application has been submitted and is pending review by the QuickCourt admin team.
          </p>
        </div>

        {/* Status card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-left space-y-4">
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">What happens next?</h2>
          <div className="space-y-3">
            {[
              { icon: CheckCircle2, color: 'text-emerald-500', label: 'Application submitted', done: true },
              { icon: Clock, color: 'text-amber-500', label: 'Admin review in progress (1–3 business days)', done: false },
              { icon: Building2, color: 'text-teal-500', label: 'Approved → add facilities & start accepting bookings', done: false },
            ].map(({ icon: Icon, color, label, done }) => (
              <div key={label} className={`flex items-center gap-3 text-sm ${done ? 'text-slate-700' : 'text-slate-400'}`}>
                <Icon className={`w-5 h-5 shrink-0 ${done ? color : 'text-slate-300'}`} />
                <span className={done ? 'font-semibold' : ''}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rejection notice */}
        {user.status === 'REJECTED' && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-left space-y-2">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <XCircle className="w-5 h-5" />
              Application Not Approved
            </div>
            <p className="text-xs text-rose-600">
              Unfortunately your application was not approved. Please contact{' '}
              <a href="mailto:support@quickcourt.com" className="underline font-semibold">support@quickcourt.com</a>{' '}
              for more information.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition"
          >
            Back to Home
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full px-6 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>

        <p className="text-xs text-slate-400">
          Questions? Email{' '}
          <a href="mailto:owners@quickcourt.com" className="text-teal-600 font-semibold hover:underline">
            owners@quickcourt.com
          </a>
        </p>
      </div>
    </div>
  );
}
