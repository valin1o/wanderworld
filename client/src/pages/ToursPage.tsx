import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toursApi } from '../lib/api';
import { Tour } from '../types';
import { TourCard } from '../components/tours/TourCard';
import { TourFilters, TourFilterState } from '../components/tours/TourFilters';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Spinner } from '../components/ui/Spinner';

export function ToursPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<TourFilterState>({
    search: searchParams.get('search') ?? '',
    difficulty: searchParams.get('difficulty') ?? '',
    tag: searchParams.get('tag') ?? '',
    sort: searchParams.get('sort') ?? 'featured',
  });

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTours = async (currentFilters: TourFilterState) => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = {};

      if (currentFilters.search) {
        params.destination = currentFilters.search;
      }
      if (currentFilters.difficulty) {
        params.difficulty = currentFilters.difficulty;
      }
      if (currentFilters.tag) {
        params.tags = currentFilters.tag;
      }

      if (currentFilters.sort === 'price-asc') {
        params.sort = 'price';
      } else if (currentFilters.sort === 'price-desc') {
        params.sort = '-price';
      } else if (currentFilters.sort === 'rating') {
        params.sort = '-ratingsAverage';
      } else if (currentFilters.sort === 'duration') {
        params.sort = '-durationDays';
      }

      const res = await toursApi.getAllTours(params);
      if (res.data?.tours) {
        setTours(res.data.tours);
        setTotalCount(res.total ?? res.data.tours.length);
      }
    } catch {
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchTours(filters);
    }, 200);

    const nextParams: Record<string, string> = {};
    if (filters.search) nextParams.search = filters.search;
    if (filters.difficulty) nextParams.difficulty = filters.difficulty;
    if (filters.tag) nextParams.tag = filters.tag;
    if (filters.sort !== 'featured') nextParams.sort = filters.sort;
    setSearchParams(nextParams, { replace: true });

    return () => clearTimeout(timer);
  }, [filters]);

  const handleReset = () => {
    setFilters({
      search: '',
      difficulty: '',
      tag: '',
      sort: 'featured',
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-brand-400">
              The Field Catalog • Verified Itineraries
            </span>
            <h1 className="mt-2 font-serif text-3xl font-extrabold text-white md:text-5xl">
              Explore Guided Adventures
            </h1>
            <p className="mt-2 text-sand-300/80 max-w-2xl text-sm md:text-base leading-relaxed">
              Browse world-class itineraries led by certified local hosts. Filter by terrain, pace, and difficulty.
            </p>
          </div>

          <TourFilters filters={filters} onChange={setFilters} onReset={handleReset} />

          <div className="flex items-center justify-between text-xs font-mono text-sand-400 border-b border-forest-800 pb-3">
            <span>
              Showing <span className="font-bold text-white">{tours.length}</span> of{' '}
              <span className="font-bold text-white">{totalCount}</span> available expeditions
            </span>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : tours.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <TourCard key={tour._id || tour.id} tour={tour} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-forest-800 bg-forest-900/60 p-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-850 border border-brand-500/30 text-brand-400">
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 9v4M12 17h.01" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold text-white">No tours found</h3>
              <p className="text-sm text-sand-300/80 max-w-md mx-auto">
                We couldn't find any expeditions matching your active filters. Try adjusting your search query, difficulty, or tags.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-brand-500 active:scale-95 transition-all shadow-glow"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
