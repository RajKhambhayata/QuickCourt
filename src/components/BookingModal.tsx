'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Loader2,
} from 'lucide-react';
import { CourtItem, SlotStatus } from '@/lib/types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  court: CourtItem;
  slot: SlotStatus;
  date: string;
  facilityName: string;
  facilityAddress: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  court,
  slot,
  date,
  facilityName,
  facilityAddress,
}: BookingModalProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING'>('UPI');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate network & payment gateway response
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: court.id,
          date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      setBookingResult(data.booking);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Payment simulation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDone = () => {
    onClose();
    router.push('/my-bookings');
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-scale-in">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure 256-Bit Checkout</span>
          </div>
          <h3 className="text-xl font-black">{facilityName}</h3>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span className="truncate">{facilityAddress}</span>
          </p>
        </div>

        {!isSuccess ? (
          <div className="p-6 space-y-6">
            {/* Summary Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-bold text-emerald-900">{court.name}</div>
                <div className="flex items-center gap-3 text-xs text-emerald-700">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {slot.time}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total</span>
                <span className="text-2xl font-black text-emerald-950">₹{slot.price}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Select Payment Mode (Simulated Gateway)
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-2 ${
                    paymentMethod === 'UPI'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-2 ${
                    paymentMethod === 'CARD'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold">Credit / Debit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('NET_BANKING')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-2 ${
                    paymentMethod === 'NET_BANKING'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Building className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold">Net Banking</span>
                </button>
              </div>

              {paymentMethod === 'UPI' && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <div className="inline-block p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                    <QrCode className="w-24 h-24 text-slate-800 mx-auto" />
                  </div>
                  <p className="text-xs text-slate-500">
                    Scan with GPay, PhonePe, Paytm, or BHIM. Instant auto-confirmation enabled.
                  </p>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Card Number (e.g. 4532 •••• •••• 8899)"
                    defaultValue="4532 9988 1234 5678"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      defaultValue="08/29"
                      className="text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      defaultValue="789"
                      className="text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'NET_BANKING' && (
                <div className="mt-4">
                  <select className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500">
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>State Bank of India</option>
                    <option>Axis Bank</option>
                  </select>
                </div>
              )}
            </div>

            <button
              disabled={isProcessing}
              onClick={handleSimulatePayment}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold text-sm transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing ₹{slot.price} Payment...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{slot.price} & Confirm Slot</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          /* Confirmation / Success Screen */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Booking Confirmed!
              </span>
              <h3 className="text-2xl font-black text-slate-900">You're Ready to Play!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Booking ID:{' '}
                <span className="font-mono font-bold text-slate-900">
                  {bookingResult?.bookingNumber || 'QC-2026-CONFIRMED'}
                </span>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Venue:</span>
                <span className="font-bold text-slate-800">{facilityName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Court:</span>
                <span className="font-bold text-slate-800">{court.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-bold text-slate-800">
                  {date} ({slot.time})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid Amount:</span>
                <span className="font-bold text-emerald-700">₹{slot.price} (Paid via {paymentMethod})</span>
              </div>
            </div>

            <button
              onClick={handleDone}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm transition shadow-md"
            >
              Go to My Bookings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
