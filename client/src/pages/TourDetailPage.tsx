import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toursApi, reviewsApi } from '../lib/api';
import { Tour, Review } from '../types';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Spinner } from '../components/ui/Spinner';
import { BookingModal } from '../components/bookings/BookingModal';
import { ReviewList } from '../components/reviews/ReviewList';
import { ReviewForm } from '../components/reviews/ReviewForm';

export function TourDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const [tour, setTour] = useState<Tour | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function loadTourData() {
      if (!slug) return;
      setLoading(true);
      setError(null);

      try {
        const res = await toursApi.getTourBySlug(slug);
        if (res.data?.tour) {
          setTour(res.data.tour);
          const tourId = res.data.tour._id || (res.data.tour.id as string);
          try {
            const reviewRes = await reviewsApi.getReviewsByTour(tourId);
            if (reviewRes.data?.reviews) {
              setReviews(reviewRes.data.reviews);
            }
          } catch {
            // Ignore error fetching reviews
          }
        } else {
          setError('Tour not found.');
        }
      } catch {
        setError('Tour not found or an error occurred while loading.');
      } finally {
        setLoading(false);
      }
    }

    void loadTourData();
  }, [slug]);

  const handleReviewSubmitted = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
    if (tour) {
      setTour({
        ...tour,
        ratingsCount: tour.ratingsCount + 1,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="card-surface p-10 text-center max-w-lg space-y-4">
            <div className="text-4xl">⚠️</div>
            <h2 className="text-2xl font-bold text-white">{error || 'Tour not found'}</h2>
            <p className="text-sm text-slate-400">
              The tour you are looking for might have been moved or is no longer active.
            </p>
            <Link
              to="/tours"
              className="inline-block rounded-xl bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-500"
            >
              Browse All Tours
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const guide = typeof tour.guideId === 'object' ? tour.guideId : null;
  const images =
    tour.images && tour.images.length > 0
      ? tour.images
      : ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'];

  const difficultyBadges = {
    easy: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/70',
    medium: 'bg-amber-950/70 text-amber-300 border-amber-800/70',
    hard: 'bg-rose-950/70 text-rose-300 border-rose-800/70',
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="flex items-center gap-2 text-xs font-mono text-sand-400">
            <Link to="/tours" className="hover:text-sand-100 transition-colors">
              Field Catalog
            </Link>
            <span>/</span>
            <span className="text-sand-300">{tour.destination}</span>
            <span>/</span>
            <span className="text-brand-400 font-semibold truncate max-w-xs">{tour.title}</span>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-0.5 text-xs font-semibold capitalize tracking-wider ${
                      difficultyBadges[tour.difficulty] || difficultyBadges.easy
                    }`}
                  >
                    {tour.difficulty} difficulty
                  </span>
                  <span className="text-xs font-mono font-semibold text-brand-300">📍 {tour.destination}</span>
                </div>
                <h1 className="mt-2 font-serif text-3xl font-extrabold text-white md:text-5xl">{tour.title}</h1>
              </div>

              <div className="flex items-center gap-2.5 text-amber-400 bg-forest-900 border border-forest-800 px-4 py-2 rounded-2xl shadow-card">
                <span className="text-lg">★</span>
                <span className="font-bold text-white text-base">
                  {tour.ratingsAverage > 0 ? tour.ratingsAverage.toFixed(1) : 'New'}
                </span>
                <span className="text-xs text-sand-400">({tour.ratingsCount} reviews)</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-forest-800 bg-forest-950 shadow-lodge">
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={tour.title}
                  className="h-full w-full object-cover transition-all duration-300"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                        activeImageIndex === idx ? 'border-brand-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-10">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-2xl border border-forest-800/80 bg-forest-900/90 p-6 text-center shadow-card">
                <div>
                  <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-sand-400">Duration</p>
                  <p className="mt-1 font-serif text-lg font-bold text-white">{tour.durationDays} Days</p>
                </div>
                <div>
                  <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-sand-400">Max Group</p>
                  <p className="mt-1 font-serif text-lg font-bold text-white">{tour.maxGroupSize} People</p>
                </div>
                <div>
                  <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-sand-400">Difficulty</p>
                  <p className="mt-1 font-serif text-lg font-bold capitalize text-white">{tour.difficulty}</p>
                </div>
                <div>
                  <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-sand-400">Price / Person</p>
                  <p className="mt-1 font-serif text-lg font-bold text-brand-400">${tour.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-8 space-y-4 shadow-card">
                <h3 className="font-serif text-2xl font-bold text-white">Expedition Overview & Route</h3>
                <div className="text-sand-200/90 leading-relaxed whitespace-pre-line text-sm md:text-base">
                  {tour.description}
                </div>

                {tour.tags && tour.tags.length > 0 && (
                  <div className="pt-4 border-t border-forest-800">
                    <p className="text-xs font-mono font-semibold uppercase tracking-wider text-sand-400 mb-2">
                      Experience Highlights:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tour.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-lg border border-forest-800 bg-forest-850 px-3 py-1 text-xs font-medium capitalize text-forest-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {guide && (
                <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-6 flex items-center gap-5 shadow-card">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-600/30 text-2xl font-serif font-bold text-brand-400 border border-brand-500/30">
                    {guide.avatarUrl ? (
                      <img src={guide.avatarUrl} alt={guide.name} className="h-full w-full rounded-2xl object-cover" />
                    ) : (
                      guide.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-brand-400">
                      Certified Wilderness Leader
                    </span>
                    <h4 className="font-serif text-lg font-bold text-white">{guide.name}</h4>
                    <p className="text-xs text-sand-400 mt-1">
                      Regional expert, certified safety provider, and local storyteller.
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-8 space-y-8 shadow-card">
                <ReviewList
                  reviews={reviews}
                  ratingsAverage={tour.ratingsAverage}
                  ratingsCount={tour.ratingsCount}
                />

                <ReviewForm tourId={tour._id || (tour.id as string)} onReviewSubmitted={handleReviewSubmitted} />
              </div>
            </div>

            <div>
              <div className="sticky top-24 rounded-2xl border border-brand-500/40 bg-forest-900/95 p-6 space-y-6 shadow-lodge">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-sand-400">Price per person</span>
                    <p className="font-serif text-3xl font-extrabold text-white">${tour.price.toLocaleString()}</p>
                  </div>
                  <span className="rounded-lg bg-emerald-950/70 px-2.5 py-1 text-xs font-semibold text-emerald-300 border border-emerald-800/70">
                    Instant Booking
                  </span>
                </div>

                <div className="space-y-3 rounded-xl border border-forest-800 bg-forest-950 p-4 text-xs text-sand-300">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> Free cancellation up to 48 hours before start
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> Expert guided expedition
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> Small group guarantee (max {tour.maxGroupSize})
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setBookingModalOpen(true)}
                  className="w-full rounded-xl bg-brand-600 py-3.5 font-bold text-white shadow-glow hover:bg-brand-500 active:scale-95 transition-all text-center"
                >
                  Book Adventure Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BookingModal
        tour={tour}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />

      <Footer />
    </div>
  );
}
