'use client';

import React, { useState, useEffect } from 'react';
import OwnerSidebar from '@/components/OwnerSidebar';
import { SPORTS_LIST } from '@/lib/constants';
import {
  Trophy,
  Plus,
  Edit2,
  Trash2,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

export default function CourtManagementPage() {
  const [courts, setCourts] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<any | null>(null);

  // Form states
  const [facilityId, setFacilityId] = useState('');
  const [name, setName] = useState('');
  const [sportType, setSportType] = useState('Badminton');
  const [surfaceType, setSurfaceType] = useState('Teakwood Synthetic');
  const [pricePerHour, setPricePerHour] = useState('450');
  const [operatingStartHour, setOperatingStartHour] = useState('6');
  const [operatingEndHour, setOperatingEndHour] = useState('23');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCourtsAndFacilities = async () => {
    try {
      const [courtsRes, facilitiesRes] = await Promise.all([
        fetch('/api/owner/courts'),
        fetch('/api/owner/facilities'),
      ]);
      const courtsData = await courtsRes.json();
      const facilitiesData = await facilitiesRes.json();

      if (courtsData.courts) setCourts(courtsData.courts);
      if (facilitiesData.facilities) {
        // Allow owner to add courts to any of their own facilities (APPROVED or PENDING)
        setFacilities(facilitiesData.facilities);
        if (facilitiesData.facilities.length > 0 && !facilityId) {
          setFacilityId(facilitiesData.facilities[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourtsAndFacilities();
  }, []);

  const openAddModal = () => {
    setEditingCourt(null);
    setName('');
    setSportType('Badminton');
    setSurfaceType('Teakwood Synthetic');
    setPricePerHour('450');
    setOperatingStartHour('6');
    setOperatingEndHour('23');
    setIsActive(true);
    if (facilities.length > 0) setFacilityId(facilities[0].id);
    setModalOpen(true);
  };

  const openEditModal = (court: any) => {
    setEditingCourt(court);
    setName(court.name);
    setSportType(court.sportType);
    setSurfaceType(court.surfaceType || 'Synthetic');
    setPricePerHour(court.pricePerHour.toString());
    setOperatingStartHour(court.operatingStartHour.toString());
    setOperatingEndHour(court.operatingEndHour.toString());
    setIsActive(court.isActive);
    setFacilityId(court.facilityId);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCourt) {
        // Update
        const res = await fetch('/api/owner/courts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingCourt.id,
            name,
            sportType,
            surfaceType,
            pricePerHour: Number(pricePerHour),
            operatingStartHour: Number(operatingStartHour),
            operatingEndHour: Number(operatingEndHour),
            isActive,
          }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchCourtsAndFacilities();
        }
      } else {
        // Create
        const res = await fetch('/api/owner/courts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facilityId,
            name,
            sportType,
            surfaceType,
            pricePerHour: Number(pricePerHour),
            operatingStartHour: Number(operatingStartHour),
            operatingEndHour: Number(operatingEndHour),
          }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchCourtsAndFacilities();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this court?')) return;
    try {
      const res = await fetch(`/api/owner/courts?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchCourtsAndFacilities();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        <OwnerSidebar />

        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>Courts & Pricing Matrix</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                Court Management
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Configure hourly rates, operating hours, surface types, and manage individual sports courts.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Court</span>
            </button>
          </div>

          {/* Courts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : courts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No courts created yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add courts to your facility so players can reserve time slots.
              </p>
              {facilities.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl max-w-sm mx-auto">
                    You need to register a sports facility / turf first before creating individual courts.
                  </p>
                  <a
                    href="/owner/facility"
                    className="inline-flex px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                  >
                    + Register Your Facility First
                  </a>
                </div>
              ) : (
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Add Your First Court
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courts.map((court) => (
                <div
                  key={court.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                        {court.sportType}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          court.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {court.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900">{court.name}</h3>

                    <div className="text-xs text-slate-500">
                      Facility: <span className="font-medium text-slate-700">{court.facility?.name}</span>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1 font-bold text-slate-900">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>₹{court.pricePerHour} / hr</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {court.operatingStartHour}:00 - {court.operatingEndHour}:00
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Surface: {court.surfaceType || 'Synthetic'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(court)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="Edit Court"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(court.id)}
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                        title="Delete Court"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Court Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {editingCourt ? 'Edit Court Configuration' : 'Add New Court'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingCourt && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Select Facility
                  </label>
                  <select
                    value={facilityId}
                    onChange={(e) => setFacilityId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} {f.status === 'PENDING' ? '⏳ (Pending Admin Review)' : '✅ (Live)'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Court Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Court 3 (Synthetic Teakwood)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Sport Type
                  </label>
                  <select
                    value={sportType}
                    onChange={(e) => setSportType(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    {SPORTS_LIST.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Hourly Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="50"
                    step="50"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Surface Material
                </label>
                <input
                  type="text"
                  placeholder="e.g. BWF Teakwood Mat, 50mm AstroTurf, Acrylic"
                  value={surfaceType}
                  onChange={(e) => setSurfaceType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Start Hour (06:00)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="23"
                    value={operatingStartHour}
                    onChange={(e) => setOperatingStartHour(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    End Hour (23:00)
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="24"
                    value={operatingEndHour}
                    onChange={(e) => setOperatingEndHour(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {saving ? 'Saving...' : editingCourt ? 'Update Court' : 'Create Court'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
