'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Eye,
  X,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

export default function AdminFacilitiesApprovalPage() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<any | null>(null);
  const [actionComments, setActionComments] = useState('');
  const [actionModal, setActionModal] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchFacilities = () => {
    setLoading(true);
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.facilities) setFacilities(data.facilities);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility || !actionModal) return;

    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/facilities/${selectedFacility.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionModal,
          comments: actionComments,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setActionModal(null);
        setSelectedFacility(null);
        setActionComments('');
        fetchFacilities();
      } else {
        alert(data.error || 'Failed to perform action');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const pendingList = facilities.filter((f) => f.status === 'PENDING');
  const approvedList = facilities.filter((f) => f.status === 'APPROVED');
  const rejectedList = facilities.filter((f) => f.status === 'REJECTED');

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        <AdminSidebar />

        <div className="flex-1 space-y-8">
          {/* Header */}
          <div>
            <div className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Facility Moderation & Verification</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Facility Approvals
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review new sports venue registration applications, inspect uploaded photos, and approve or reject listings.
            </p>
          </div>

          {/* Pending Applications Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>Pending Verification Queue</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                  {pendingList.length}
                </span>
              </h2>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Checking pending queues...
              </div>
            ) : pendingList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                ✨ All caught up! No pending facility registration requests right now.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingList.map((f) => (
                  <div
                    key={f.id}
                    className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={f.images?.[0] || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300'}
                        alt={f.name}
                        className="w-20 h-20 rounded-xl object-cover border border-amber-200 shrink-0"
                      />
                      <div className="space-y-1">
                        <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                          Pending Review
                        </span>
                        <h3 className="text-base font-black text-slate-900">{f.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{f.address}, {f.city}</span>
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-2 pt-1">{f.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        onClick={() => {
                          setSelectedFacility(f);
                          setActionModal('APPROVE');
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedFacility(f);
                          setActionModal('REJECT');
                        }}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Live / Historical Approved Facilities */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900">All Registered Venues ({facilities.length})</h2>
            <div className="divide-y divide-slate-100">
              {facilities.map((f) => (
                <div key={f.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{f.name}</div>
                    <div className="text-slate-500">{f.city} • Manager: {f.owner?.name || 'Owner'}</div>
                  </div>
                  <div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        f.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : f.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {f.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Approve / Reject Modal */}
      {actionModal && selectedFacility && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {actionModal === 'APPROVE' ? 'Approve Venue Listing' : 'Reject Venue Listing'}
              </h3>
              <button
                onClick={() => setActionModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <p className="text-slate-600">
                {actionModal === 'APPROVE'
                  ? `Are you sure you want to approve "${selectedFacility.name}"? It will immediately become visible to players on the public directory.`
                  : `Please specify the reason for rejecting "${selectedFacility.name}". The owner will receive this feedback.`}
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Optional Review Notes / Feedback
                </label>
                <textarea
                  rows={3}
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  placeholder={
                    actionModal === 'APPROVE'
                      ? 'e.g. Verified BWF flooring and verified safety measures.'
                      : 'e.g. Please upload higher resolution court photos.'
                  }
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleActionSubmit}
                className={`px-6 py-2 rounded-xl text-xs font-bold text-white shadow-sm ${
                  actionModal === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {processing
                  ? 'Submitting...'
                  : actionModal === 'APPROVE'
                  ? 'Confirm Approval'
                  : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
