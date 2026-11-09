import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { reviewsApi } from '../../lib/api';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';
import { Review } from '../../types';

interface ReviewFormProps {
  tourId: string;
  onReviewSubmitted: (review: Review) => void;
}

export function ReviewForm({ tourId, onReviewSubmitted }: ReviewFormProps) {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated || user?.role !== 'traveler') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 10) {
      setError('Please write at least 10 characters in your review.');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await reviewsApi.createReview(tourId, { rating, comment });
      if (res.data?.review) {
        setSuccess('Thank you! Your review has been posted.');
        setComment('');
        setRating(5);
        onReviewSubmitted(res.data.review);
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError.response?.data?.message ??
          'Could not post review. Note: you can only review tours you have booked and completed.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-forest-800 bg-forest-950/70 p-6 space-y-4 shadow-card">
      <h4 className="font-serif text-lg font-bold text-white">Leave a Review</h4>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-sand-300 mb-1">
            Rating
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl transition-transform hover:scale-110 ${
                  star <= rating ? 'text-amber-400' : 'text-forest-700'
                }`}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
            <span className="text-xs font-mono font-semibold text-sand-300 ml-2">
              {rating} of 5 stars
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="review-comment" className="block text-xs font-mono font-semibold uppercase tracking-wider text-sand-300 mb-1">
            Your Experience
          </label>
          <textarea
            id="review-comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details about the guide, terrain, pace, and memorable highlights..."
            className="w-full rounded-xl border border-forest-700/80 bg-forest-900 p-3 text-sm text-sand-100 placeholder:text-sand-500 outline-none focus:border-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-glow hover:bg-brand-500 active:scale-95 disabled:opacity-50 transition-all"
        >
          {loading && <Spinner size="sm" />}
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
