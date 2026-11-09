import React from 'react';
import { TourTag } from '../../types';

export interface TourFilterState {
  search: string;
  difficulty: string;
  tag: string;
  sort: string;
  maxPrice?: number;
}

interface TourFiltersProps {
  filters: TourFilterState;
  onChange: (filters: TourFilterState) => void;
  onReset: () => void;
}

const TAG_OPTIONS: TourTag[] = [
  'mountains',
  'sea',
  'culture',
  'adventure',
  'wildlife',
  'urban',
  'desert',
  'forest',
  'arctic',
];

export function TourFilters({ filters, onChange, onReset }: TourFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, difficulty: e.target.value });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, sort: e.target.value });
  };

  const handleTagToggle = (tag: string) => {
    onChange({ ...filters, tag: filters.tag === tag ? '' : tag });
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.difficulty) ||
    Boolean(filters.tag) ||
    filters.sort !== 'featured';

  return (
    <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-6 space-y-6 shadow-lodge">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <label htmlFor="filter-search" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sand-300">
            Destination / Title
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-forest-400">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              id="filter-search"
              type="text"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="e.g. Iceland, Alps, Tokyo..."
              className="w-full rounded-xl border border-forest-700/80 bg-forest-950/90 py-2.5 pl-10 pr-4 text-sm text-sand-100 placeholder:text-sand-500 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="filter-difficulty" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sand-300">
            Difficulty
          </label>
          <select
            id="filter-difficulty"
            value={filters.difficulty}
            onChange={handleDifficultyChange}
            className="w-full rounded-xl border border-forest-700/80 bg-forest-950/90 px-3 py-2.5 text-sm text-sand-100 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy (Paced)</option>
            <option value="medium">Medium (Moderate)</option>
            <option value="hard">Hard (Demanding)</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-sort" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sand-300">
            Sort by
          </label>
          <select
            id="filter-sort"
            value={filters.sort}
            onChange={handleSortChange}
            className="w-full rounded-xl border border-forest-700/80 bg-forest-950/90 px-3 py-2.5 text-sm text-sand-100 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            <option value="featured">Featured Picks</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="duration">Expedition Length</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-sand-300">
            Expedition Terrain & Experiences
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-medium text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors"
            >
              Reset all filters
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => {
            const isSelected = filters.tag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-glow border border-brand-500'
                    : 'border border-forest-800 bg-forest-950/80 text-sand-300 hover:border-forest-600 hover:text-white'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
