import React, { useEffect, useState } from 'react';
import { AiPreference, Terrain, Activity, Budget, TravelStyle, Tour } from '../../types';
import { aiApi } from '../../lib/api';
import { TourCard } from '../tours/TourCard';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';
import { useAuth } from '../../contexts/AuthContext';

const TERRAINS: { id: Terrain; label: string; icon: string }[] = [
  { id: 'mountains', label: 'Mountains', icon: '🏔️' },
  { id: 'sea', label: 'Coastal & Sea', icon: '🌊' },
  { id: 'forest', label: 'Forests & Jungles', icon: '🌲' },
  { id: 'desert', label: 'Deserts', icon: '🏜️' },
  { id: 'arctic', label: 'Arctic & Tundra', icon: '❄️' },
];

const ACTIVITIES: { id: Activity; label: string; icon: string }[] = [
  { id: 'hiking', label: 'Hiking & Trekking', icon: '🥾' },
  { id: 'adventure', label: 'Adventure Sports', icon: '🧗' },
  { id: 'culture', label: 'Culture & Heritage', icon: '🏛️' },
  { id: 'wildlife', label: 'Wildlife Safari', icon: '🐾' },
  { id: 'diving', label: 'Diving & Marine', icon: '🤿' },
  { id: 'food', label: 'Culinary Experiences', icon: '🍜' },
  { id: 'sightseeing', label: 'Scenic Sightseeing', icon: '📸' },
];

export function AiTripPlanner() {
  const { isAuthenticated } = useAuth();
  const [preferences, setPreferences] = useState<AiPreference>({
    terrain: ['mountains'],
    activities: ['hiking', 'adventure'],
    budget: 'mid-range',
    travelStyle: 'solo',
    groupSize: 1,
    durationDays: 7,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [recommendedTours, setRecommendedTours] = useState<Tour[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      void (async () => {
        try {
          const res = await aiApi.getPreferences();
          if (res.data?.preferences) {
            setPreferences((prev) => ({
              ...prev,
              ...res.data.preferences,
            }));
          }
        } catch {
          // Ignore error loading preferences
        }
      })();
    }
  }, [isAuthenticated]);

  const toggleTerrain = (t: Terrain) => {
    setPreferences((prev) => {
      const exists = prev.terrain.includes(t);
      const next = exists ? prev.terrain.filter((x) => x !== t) : [...prev.terrain, t];
      return { ...prev, terrain: next };
    });
  };

  const toggleActivity = (a: Activity) => {
    setPreferences((prev) => {
      const exists = prev.activities.includes(a);
      const next = exists ? prev.activities.filter((x) => x !== a) : [...prev.activities, a];
      return { ...prev, activities: next };
    });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in as a traveler to generate AI recommendations.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await aiApi.getRecommendations(preferences);
      if (res.data) {
        setNarrative(res.data.narrative);
        setRecommendedTours(res.data.tours || []);
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError.response?.data?.message ??
          'Failed to generate recommendations. Please check your network and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-6 md:p-8 shadow-lodge">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-850 border border-brand-500/40 text-brand-400 font-bold shadow-card">
            <svg className="h-5 w-5 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">AI Travel Planner</h2>
            <p className="text-xs text-sand-300/80 mt-0.5">
              Powered by IBM watsonx.ai to craft your custom expedition blueprint and match you with expert guided itineraries.
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="error" className="mt-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleGenerate} className="mt-8 space-y-6">
          <div>
            <label className="mb-2.5 block text-xs font-mono font-semibold uppercase tracking-wider text-sand-300">
              Select Preferred Terrains & Environments
            </label>
            <div className="flex flex-wrap gap-2.5">
              {TERRAINS.map(({ id, label, icon }) => {
                const selected = preferences.terrain.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleTerrain(id)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all active:scale-95 ${
                      selected
                        ? 'bg-brand-600 text-white shadow-glow border border-brand-500'
                        : 'border border-forest-800 bg-forest-950/80 text-sand-300 hover:border-forest-600 hover:text-white'
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2.5 block text-xs font-mono font-semibold uppercase tracking-wider text-sand-300">
              Favorite Activities & Styles
            </label>
            <div className="flex flex-wrap gap-2.5">
              {ACTIVITIES.map(({ id, label, icon }) => {
                const selected = preferences.activities.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleActivity(id)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all active:scale-95 ${
                      selected
                        ? 'bg-brand-600 text-white shadow-glow border border-brand-500'
                        : 'border border-forest-800 bg-forest-950/80 text-sand-300 hover:border-forest-600 hover:text-white'
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label htmlFor="pref-budget" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sand-300">
                Budget Tier
              </label>
              <select
                id="pref-budget"
                value={preferences.budget}
                onChange={(e) => setPreferences({ ...preferences, budget: e.target.value as Budget })}
                className="w-full rounded-xl border border-forest-700/80 bg-forest-950/90 px-3 py-2 text-xs text-sand-100 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                <option value="budget">Budget-Friendly</option>
                <option value="mid-range">Mid-Range (Standard)</option>
                <option value="luxury">Luxury & Premium</option>
              </select>
            </div>

            <div>
              <label htmlFor="pref-style" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sand-300">
                Travel Style
              </label>
              <select
                id="pref-style"
                value={preferences.travelStyle}
                onChange={(e) =>
                  setPreferences({ ...preferences, travelStyle: e.target.value as TravelStyle })
                }
                className="w-full rounded-xl border border-forest-700/80 bg-forest-950/90 px-3 py-2 text-xs text-sand-100 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                <option value="solo">Solo Explorer</option>
                <option value="couple">Couple / Duo</option>
                <option value="family">Family Adventure</option>
                <option value="group">Group of Friends</option>
              </select>
            </div>

            <div>
              <label htmlFor="pref-duration" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sand-300">
                Duration (Days)
              </label>
              <input
                id="pref-duration"
                type="number"
                min={1}
                max={60}
                value={preferences.durationDays}
                onChange={(e) =>
                  setPreferences({ ...preferences, durationDays: parseInt(e.target.value, 10) || 7 })
                }
                className="w-full rounded-xl border border-forest-700/80 bg-forest-950/90 px-3 py-2 text-xs text-sand-100 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label htmlFor="pref-group" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sand-300">
                Group Size
              </label>
              <input
                id="pref-group"
                type="number"
                min={1}
                max={30}
                value={preferences.groupSize}
                onChange={(e) =>
                  setPreferences({ ...preferences, groupSize: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full rounded-xl border border-forest-700/80 bg-forest-950/90 px-3 py-2 text-xs text-sand-100 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-bold text-white shadow-glow hover:bg-brand-500 active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading && <Spinner size="sm" />}
              {loading ? 'Crafting your personalized trip...' : '✨ Generate AI Itinerary Plan'}
            </button>
          </div>
        </form>
      </div>

      {narrative && (
        <div className="rounded-2xl border border-brand-500/40 bg-forest-900/95 p-6 md:p-8 space-y-6 shadow-lodge">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-850 border border-brand-500/40 text-brand-400">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <polygon points="12 4 15 12 12 20 9 12" fill="currentColor" fillOpacity="0.2" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl font-bold text-white">Your AI Custom Travel Blueprint</h3>
          </div>

          <div className="rounded-xl border border-forest-800 bg-forest-950/90 p-6 text-sm text-sand-200/95 leading-relaxed whitespace-pre-line font-sans">
            {narrative}
          </div>

          {recommendedTours.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-forest-800">
              <h4 className="font-serif text-lg font-bold text-white">Recommended Tours Matching Your Plan:</h4>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendedTours.map((tour) => (
                  <TourCard key={tour._id || tour.id} tour={tour} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
