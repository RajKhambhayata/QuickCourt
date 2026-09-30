'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  UserCog,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  Building2,
  Search,
  Loader2,
} from 'lucide-react';

type Owner = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  status: string;
  createdAt: string;
  _count: { facilities: number };
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  PENDING_APPROVAL: { label: 'Pending Review', color: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
  ACTIVE: { label: 'Approved & Active', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  REJECTED: { label: 'Rejected', color: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-500' },
  BANNED: { label: 'Banned', color: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-400' },
};

export default function AdminOwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING_APPROVAL');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ owner: Owner } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchOwners = () => {
    setLoading(true);
    fetch('/api/admin/owners')
      .then((r) => r.json())
      .then((d) => { if (d.owners) setOwners(d.owners); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOwners(); }, []);

  const handleAction = async (ownerId: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    setProcessingId(ownerId);
    try {
      const res = await fetch(`/api/admin/owners/${ownerId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        setRejectModal(null);
        setRejectReason('');
        fetchOwners();
      } else {
        showToast(data.error || 'Action failed', 'error');
      }
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = owners.filter((o) => {
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchSearch = !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pendingCount = owners.filter((o) => o.status === 'PENDING_APPROVAL').length;

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        <AdminSidebar />

        <div className="flex-1 space-y-6">
          {/* Toast */}
          {toast && (
            <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              {toast.msg}
            </div>
          )}

          {/* Header */}
          <div className="bg-gradient-to-r from-purple-700 via-purple-800 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-white/10 text-purple-300 border border-white/20">
                <UserCog className="w-3.5 h-3.5" />
                <span>Owner Approvals</span>
              </div>
              <h1 className="text-2xl font-black">Facility Owner Applications</h1>
              <p className="text-xs text-purple-200">Review and approve or reject facility owner account applications.</p>
            </div>
            {pendingCount > 0 && (
              <div className="bg-amber-500 text-white rounded-2xl px-5 py-3 text-center">
                <div className="text-3xl font-black">{pendingCount}</div>
                <div className="text-xs font-semibold">Pending</div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search owners by name or email..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'PENDING_APPROVAL', label: `Pending (${owners.filter(o => o.status === 'PENDING_APPROVAL').length})` },
                { key: 'ACTIVE', label: `Approved (${owners.filter(o => o.status === 'ACTIVE').length})` },
                { key: 'REJECTED', label: 'Rejected' },
                { key: 'ALL', label: 'All' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition ${statusFilter === key ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Owner Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <UserCog className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">No owner applications found</p>
              <p className="text-xs text-slate-400">New applications will appear here for review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((owner) => {
                const cfg = STATUS_CONFIG[owner.status] || STATUS_CONFIG.ACTIVE;
                const isPending = owner.status === 'PENDING_APPROVAL';
                const isProcessing = processingId === owner.id;
                return (
                  <div key={owner.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm hover:shadow-md transition">
                    <img
                      src={owner.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                      alt={owner.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{owner.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{owner.email}</span>
                        {owner.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{owner.phone}</span>}
                        <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{owner._count.facilities} {owner._count.facilities === 1 ? 'facility' : 'facilities'}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Applied {new Date(owner.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {isPending && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleAction(owner.id, 'APPROVE')}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                        >
                          {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({ owner })}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    )}
                    {owner.status === 'ACTIVE' && (
                      <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold shrink-0">
                        <CheckCircle2 className="w-4 h-4" /> Approved
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setRejectModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-black text-slate-900">Reject Application</h3>
            <p className="text-xs text-slate-500">You are rejecting the application for <strong>{rejectModal.owner.name}</strong>. Optionally provide a reason.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)..."
              rows={3}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:border-rose-400"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRejectModal(null)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancel</button>
              <button
                onClick={() => handleAction(rejectModal.owner.id, 'REJECT', rejectReason)}
                disabled={processingId === rejectModal.owner.id}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                {processingId === rejectModal.owner.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
