'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchReports = () => {
    setLoading(true);
    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        if (data.reports) setReports(data.reports);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateReportStatus = async (id: string, status: 'RESOLVED' | 'DISMISSED') => {
    setProcessingId(id);
    try {
      const res = await fetch('/api/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) fetchReports();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        <AdminSidebar />

        <div className="flex-1 space-y-6">
          {/* Header */}
          <div>
            <div className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Trust & Safety Center</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Reports & Community Moderation
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review flagged issues submitted by players, resolve facility disputes, and maintain platform standards.
            </p>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>Incident Reports Queue</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                {reports.length}
              </span>
            </h2>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Loading moderation reports...
              </div>
            ) : reports.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                ✨ No incident reports filed. Platform health is 100%!
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            report.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : report.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {report.status}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          Target: {report.targetName} ({report.targetType})
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        "{report.reason}"
                      </p>

                      <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                        <span>Reported by: <strong className="text-slate-700">{report.reportedBy?.name || 'Player'}</strong></span>
                        <span>•</span>
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {report.status === 'PENDING' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          disabled={processingId === report.id}
                          onClick={() => handleUpdateReportStatus(report.id, 'RESOLVED')}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>

                        <button
                          disabled={processingId === report.id}
                          onClick={() => handleUpdateReportStatus(report.id, 'DISMISSED')}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
