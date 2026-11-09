import React from 'react';
import { Link } from 'react-router-dom';
import { Tour } from '../../types';

interface TourCardProps {
  tour: Tour;
}

export function TourCard({ tour }: TourCardProps) {
  const difficultyBadges = {
    easy: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/70',
    medium: 'bg-amber-950/70 text-amber-300 border-amber-800/70',
    hard: 'bg-rose-950/70 text-rose-300 border-rose-800/70',
  };

  const imageSrc =
    tour.images && tour.images.length > 0
      ? tour.images[0]
      : 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-forest-800/80 bg-forest-900/90 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-lodge">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-forest-950">
        <img
          src={imageSrc}
          alt={tour.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-transparent to-black/20" />
        
        <div className="absolute left-3.5 top-3.5 flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize tracking-wide shadow-sm backdrop-blur-md ${
              difficultyBadges[tour.difficulty] || difficultyBadges.easy
            }`}
          >
            {tour.difficulty}
          </span>
        </div>

        <div className="absolute bottom-3 right-3.5 rounded-lg border border-forest-700/80 bg-forest-950/85 px-2.5 py-1 text-xs font-semibold text-sand-200 backdrop-blur-sm">
          {tour.durationDays} {tour.durationDays === 1 ? 'day' : 'days'}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between text-xs text-brand-300 font-medium">
          <span className="flex items-center gap-1.5 truncate max-w-[65%]">
            <span className="text-brand-400">📍</span>
            <span className="truncate">{tour.destination}</span>
          </span>
          <div className="flex items-center gap-1 text-amber-400">
            <span className="text-amber-400">★</span>
            <span className="font-bold text-sand-100">
              {tour.ratingsAverage > 0 ? tour.ratingsAverage.toFixed(1) : 'New'}
            </span>
            {tour.ratingsCount > 0 && <span className="text-sand-400 text-[11px]">({tour.ratingsCount})</span>}
          </div>
        </div>

        <h3 className="mt-2.5 font-serif text-lg font-bold text-white transition-colors group-hover:text-brand-300 line-clamp-1">
          <Link to={`/tours/${tour.slug}`}>{tour.title}</Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-sand-300/80 flex-1">
          {tour.description}
        </p>

        {tour.tags && tour.tags.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {tour.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-forest-800/80 bg-forest-850 px-2 py-0.5 text-[10px] font-medium text-forest-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-forest-800/80 pt-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-sand-400">From</span>
            <p className="text-lg font-bold text-white">
              ${tour.price.toLocaleString()} <span className="text-xs font-normal text-sand-400">/ person</span>
            </p>
          </div>
          <Link
            to={`/tours/${tour.slug}`}
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-glow transition-all hover:bg-brand-500 active:scale-95"
          >
            Explore
          </Link>
        </div>
      </div>
    </article>
  );
}
