'use client';

import React, { useState } from 'react';
import { Star, MessageSquare, Send, Sparkles, AlertCircle } from 'lucide-react';
import { ReviewItem } from '@/lib/types';

interface ReviewSectionProps {
  facilityId: string;
  reviews: ReviewItem[];
  avgRating: number;
}

export default function ReviewSection({ facilityId, reviews: initialReviews, avgRating }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/venues/${facilityId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setReviews([data.review, ...reviews]);
      setComment('');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span>Player Reviews & Ratings</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
              {reviews.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Verified feedback from sports community players</p>
        </div>

        <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
          <div className="text-2xl font-black text-emerald-900">{avgRating ? avgRating.toFixed(1) : '5.0'}</div>
          <div className="flex items-center text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= Math.round(avgRating || 5) ? 'fill-amber-500' : 'text-slate-300'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Review Submission Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Leave a Review</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 text-amber-400 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-5 h-5 ${
                    star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (e.g. lighting quality, court bounce, locker cleanliness)..."
          className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 resize-none"
        />

        {error && (
          <p className="text-xs text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </p>
        )}

        {success && (
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thank you for your review!</span>
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !comment.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Posting...' : 'Post Review'}</span>
          </button>
        </div>
      </form>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No reviews yet. Be the first player to review this venue!
          </div>
        ) : (
          reviews.map((r, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/50 transition">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={r.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={r.user?.name || 'Player'}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-800">{r.user?.name || 'Verified Player'}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-amber-400">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-9">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
