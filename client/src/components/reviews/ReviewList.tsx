import React from 'react';
import { Review } from '../../types';

interface ReviewListProps {
  reviews: Review[];
  ratingsAverage: number;
  ratingsCount: number;
}

export function ReviewList({ reviews, ratingsAverage, ratingsCount }: ReviewListProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest-800 pb-6">
        <div>
          <h3 className="font-serif text-2xl font-bold text-white">Traveler Reviews</h3>
          <p className="mt-1 text-xs text-sand-400 font-mono">Authentic dispatches from verified adventurers</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-forest-800 bg-forest-950/80 px-5 py-3 shadow-card">
          <div className="font-serif text-3xl font-extrabold text-white">
            {ratingsAverage > 0 ? ratingsAverage.toFixed(1) : '—'}
          </div>
          <div>
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>{star <= Math.round(ratingsAverage) ? '★' : '☆'}</span>
              ))}
            </div>
            <p className="text-xs font-mono text-sand-400">
              {ratingsCount} {ratingsCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="py-8 text-center text-sand-400">
          <p>No reviews yet. Be the first to review after booking this adventure!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => {
            const userName =
              typeof review.userId === 'object' && review.userId?.name
                ? review.userId.name
                : 'Verified Traveler';
            const initial = userName.charAt(0).toUpperCase();

            return (
              <div
                key={review._id || review.id}
                className="rounded-2xl border border-forest-800/80 bg-forest-950/80 p-5 space-y-3 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-850 border border-brand-500/30 text-sm font-serif font-bold text-brand-400">
                      {initial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{userName}</p>
                      <p className="text-[11px] font-mono text-sand-400">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                  </div>
                  <div className="flex text-amber-400 text-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>{star <= review.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-sand-200/90">{review.comment}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
