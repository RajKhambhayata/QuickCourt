'use client';

import React, { useState, useEffect } from 'react';
import OwnerSidebar from '@/components/OwnerSidebar';
import { SPORTS_LIST, AMENITIES_LIST, CITIES_LIST } from '@/lib/constants';
import {
  Building2,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  PlusCircle,
} from 'lucide-react';

export default function FacilityManagementPage() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [venueType, setVenueType] = useState('Indoor');
  const [selectedSports, setSelectedSports] = useState<string[]>(['Badminton']);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Floodlights',
    'Free Parking',
    'Changing Rooms',
    'Drinking Water',
  ]);
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1000',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const fetchFacilities = () => {
    fetch('/api/owner/facilities')
      .then((res) => res.json())
      .then((data) => {
        if (data.facilities && data.facilities.length > 0) {
          setFacilities(data.facilities);
          if (!selectedFacilityId || !data.facilities.find((f: any) => f.id === selectedFacilityId)) {
            const first = data.facilities[0];
            setSelectedFacilityId(first.id);
            loadFacilityData(first);
          }
        } else {
          setFacilities([]);
          setIsCreatingNew(true);
          resetForm();
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setAddress('');
    setCity('Bangalore');
    setVenueType('Indoor');
    setSelectedSports(['Badminton']);
    setSelectedAmenities(['Floodlights', 'Free Parking', 'Changing Rooms', 'Drinking Water']);
    setImages(['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1000']);
  };

  const loadFacilityData = (f: any) => {
    setName(f.name || '');
    setDescription(f.description || '');
    setAddress(f.address || '');
    setCity(f.city || 'Bangalore');
    setVenueType(f.venueType || 'Indoor');
    setSelectedSports(f.sports || ['Badminton']);
    setSelectedAmenities(f.amenities || ['Floodlights', 'Free Parking']);
    setImages(f.images || ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1000']);
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleSelectFacility = (fId: string) => {
    setIsCreatingNew(false);
    setSelectedFacilityId(fId);
    const found = facilities.find((f) => f.id === fId);
    if (found) loadFacilityData(found);
  };

  const startCreateNew = () => {
    setIsCreatingNew(true);
    resetForm();
    setSuccessMsg(null);
  };

  const handleSportToggle = (sportId: string) => {
    if (selectedSports.includes(sportId)) {
      setSelectedSports(selectedSports.filter((s) => s !== sportId));
    } else {
      setSelectedSports([...selectedSports, sportId]);
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      if (isCreatingNew) {
        // POST new facility via dedicated owner facilities endpoint
        const res = await fetch('/api/owner/facilities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description,
            address,
            city,
            venueType,
            sports: selectedSports,
            amenities: selectedAmenities,
            images,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setSuccessMsg('New facility submitted successfully! It is now pending admin review. You can now add courts and pricing in Courts & Pricing.');
          setIsCreatingNew(false);
          fetchFacilities();
        } else {
          alert(data.error || 'Failed to create facility');
        }
      } else {
        // PUT update existing
        const res = await fetch(`/api/venues/${selectedFacilityId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description,
            address,
            city,
            venueType,
            sports: selectedSports,
            amenities: selectedAmenities,
            images,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setSuccessMsg('Facility details updated and saved successfully!');
          fetchFacilities();
        } else {
          alert(data.error || 'Failed to update');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error saving facility');
    } finally {
      setSaving(false);
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
                <Building2 className="w-3.5 h-3.5" />
                <span>Facility Information & Photos</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                {isCreatingNew ? 'Register New Sports Arena' : 'Facility Management'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {isCreatingNew
                  ? 'Submit a brand new sports complex for platform onboarding and player bookings.'
                  : 'Update arena details, sports configuration, amenities, and photo gallery.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!isCreatingNew && (
                <button
                  type="button"
                  onClick={startCreateNew}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Register New Facility</span>
                </button>
              )}

              {facilities.length > 0 && !isCreatingNew && (
                <select
                  value={selectedFacilityId}
                  onChange={(e) => handleSelectFacility(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                >
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.status})
                    </option>
                  ))}
                </select>
              )}

              {isCreatingNew && facilities.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    loadFacilityData(facilities[0]);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition"
                >
                  Cancel & Edit Existing
                </button>
              )}
            </div>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isCreatingNew && selectedFacilityId && (() => {
            const current = facilities.find((f) => f.id === selectedFacilityId);
            if (!current) return null;
            if (current.status === 'PENDING') {
              return (
                <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block text-sm text-amber-950">Pending Admin Verification</span>
                    <span className="text-amber-800 leading-relaxed">
                      "{current.name}" is submitted and currently under review by the QuickCourt admin team. You can continue configuring courts, pricing, and details below.
                    </span>
                  </div>
                </div>
              );
            }
            if (current.status === 'APPROVED') {
              return (
                <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-extrabold block text-sm text-emerald-950">Live & Published</span>
                    <span className="text-emerald-800">
                      "{current.name}" is approved and accepting online bookings from players on the public venue directory.
                    </span>
                  </div>
                </div>
              );
            }
            if (current.status === 'REJECTED') {
              return (
                <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 text-xs rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block text-sm text-rose-950">Venue Listing Rejected</span>
                    <span className="text-rose-800">
                      Reason: {current.rejectionReason || 'Did not meet quality standards. Please update details and resubmit.'}
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            {/* 1. Basic Details */}
            <div className="space-y-4">
              <h3 className="text-base font-black text-slate-900 pb-2 border-b border-slate-100">
                1. Basic Facility Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Facility Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Smash Badminton Club"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    City / Region
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    {CITIES_LIST.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Full Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 100 Feet Road, Indiranagar"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Environment Type
                  </label>
                  <select
                    value={venueType}
                    onChange={(e) => setVenueType(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="Indoor">Indoor (Air Cooled / Teakwood)</option>
                    <option value="Outdoor">Outdoor (Floodlit / Astroturf)</option>
                    <option value="Indoor & Outdoor">Indoor & Outdoor Multi-Complex</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  About Facility & Highlights
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe court quality, lighting, and spectator areas..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 font-medium resize-none"
                />
              </div>
            </div>

            {/* 2. Sports Supported */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-base font-black text-slate-900">2. Sports Supported</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SPORTS_LIST.map((sport) => {
                  const isChecked = selectedSports.includes(sport.id);
                  return (
                    <button
                      type="button"
                      key={sport.id}
                      onClick={() => handleSportToggle(sport.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span>{sport.icon}</span>
                      <span>{sport.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Amenities Offered */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-base font-black text-slate-900">3. Amenities Offered</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {AMENITIES_LIST.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity);
                  return (
                    <button
                      type="button"
                      key={amenity}
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`p-2 rounded-lg border text-xs font-semibold transition text-left flex items-center justify-between ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <span>{amenity}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Photo Gallery Management */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-base font-black text-slate-900">4. Photo Gallery</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative h-32 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Paste image URL (https://images.unsplash.com/...)"
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Photo
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : isCreatingNew ? 'Submit New Facility' : 'Save All Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
