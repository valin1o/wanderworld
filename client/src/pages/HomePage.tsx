import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toursApi } from '../lib/api';
import { Tour } from '../types';
import { TourCard } from '../components/tours/TourCard';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Spinner } from '../components/ui/Spinner';

export function HomePage() {
  const [topTours, setTopTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTopTours() {
      try {
        const res = await toursApi.getTop5Cheap();
        if (res.data?.tours) {
          setTopTours(res.data.tours);
        }
      } catch {
        // Ignore fetch error
      } finally {
        setLoading(false);
      }
    }
    void loadTopTours();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden px-6 pt-12 pb-20 md:pt-16 md:pb-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-forest-700/80 bg-forest-900/90 px-3.5 py-1 text-xs font-semibold text-sand-300 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
                  <span className="font-mono text-[11px] text-brand-400">EST. 2025</span>
                  <span className="text-forest-500">•</span>
                  <span>Handcrafted Expeditions & Field Guidance</span>
                </div>

                <h1 className="font-serif text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-6xl leading-[1.1]">
                  Step off the beaten path. <br />
                  <span className="italic text-brand-300 font-normal">Roam with local masters.</span>
                </h1>

                <p className="text-base text-sand-300/90 sm:text-lg max-w-xl leading-relaxed">
                  Authentic wilderness treks, high alpine traverses, and cultural immersions led by certified naturalists. Personalized with watsonx.ai itinerary curation and guaranteed small group sizes.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to="/tours"
                    className="rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-bold text-white shadow-glow transition-all hover:bg-brand-500 active:scale-95 flex items-center gap-2"
                  >
                    <span>Browse All Expeditions</span>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                  <Link
                    to="/dashboard/traveler"
                    className="rounded-xl border border-forest-700 bg-forest-900/80 px-6 py-3.5 text-sm font-semibold text-sand-100 transition-all hover:border-brand-500/60 hover:bg-forest-850 hover:text-white"
                  >
                    ✨ Try AI Trip Planner
                  </Link>
                </div>

                <div className="pt-6 border-t border-forest-800/80 grid grid-cols-3 gap-4 max-w-lg">
                  <div>
                    <p className="font-serif text-2xl font-bold text-white">100%</p>
                    <p className="text-xs text-sand-400 mt-0.5">Certified Local Hosts</p>
                  </div>
                  <div>
                    <p className="font-serif text-2xl font-bold text-brand-400">48h</p>
                    <p className="text-xs text-sand-400 mt-0.5">Flexible Cancellation</p>
                  </div>
                  <div>
                    <p className="font-serif text-2xl font-bold text-sand-200">4.9 ★</p>
                    <p className="text-xs text-sand-400 mt-0.5">Average Host Score</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  <div className="absolute -inset-2 rounded-3xl border border-forest-700/50 bg-forest-900/40 transform rotate-1 -z-10" />

                  <div className="overflow-hidden rounded-2xl border border-forest-700/80 bg-forest-900 shadow-lodge">
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
                        alt="Yosemite Valley Mist Expedition"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/20 to-transparent" />
                      <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                        <span className="rounded-full bg-forest-950/80 backdrop-blur-md px-3 py-1 text-[11px] font-mono font-semibold text-brand-300 border border-brand-500/30">
                          DISPATCH #042 • AUTUMN PASSAGE
                        </span>
                      </div>
                      <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                        <span className="text-xs font-mono uppercase tracking-wider text-forest-300">
                          📍 Patagonia Glacier & Alpine Traverse
                        </span>
                        <h3 className="font-serif text-xl font-bold text-white mt-1">
                          Torres del Paine Remote Circuit
                        </h3>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between text-xs text-sand-300 border-b border-forest-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-brand-600/30 text-brand-400 flex items-center justify-center font-bold text-xs">
                            G
                          </span>
                          <span>Hosted by Gunnar (Naturalist)</span>
                        </div>
                        <span className="font-semibold text-brand-400">7 Days • 12 Max</span>
                      </div>
                      <p className="text-xs text-sand-300/80 leading-relaxed">
                        "Traversing the remote southern icecap with crampons and local geological insight. An unforgettable trek into the wild."
                      </p>
                      <Link
                        to="/tours"
                        className="block w-full rounded-xl border border-forest-700 bg-forest-850 py-2.5 text-center text-xs font-bold text-sand-100 hover:border-brand-500/60 hover:text-white transition-colors"
                      >
                        Explore Similar Itineraries &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-forest-800/80 bg-forest-950/70 px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-brand-400">
                The WanderWorld Standard
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold text-white md:text-4xl">
                Built for explorers who value depth over checklists
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-7 shadow-card space-y-4 hover:border-forest-700 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-850 border border-brand-500/30 text-brand-400">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="9" />
                    <polygon points="12 4 15 12 12 20 9 12" fill="currentColor" fillOpacity="0.2" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-bold text-white">Vetted Field Guides</h3>
                <p className="text-xs leading-relaxed text-sand-300/90">
                  Every expedition is led by verified regional naturalists, geologists, or certified mountaineers who prioritize safety, rich cultural storytelling, and environmental respect.
                </p>
              </div>

              <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-7 shadow-card space-y-4 hover:border-forest-700 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-850 border border-brand-500/30 text-brand-400">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-bold text-white">watsonx.ai Travel Planner</h3>
                <p className="text-xs leading-relaxed text-sand-300/90">
                  Input your exact terrain appetite, endurance level, and preferred pace to receive custom expedition blueprints and matched verified routes tailored just for you.
                </p>
              </div>

              <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-7 shadow-card space-y-4 hover:border-forest-700 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-850 border border-brand-500/30 text-brand-400">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-bold text-white">Seamless Stripe Security</h3>
                <p className="text-xs leading-relaxed text-sand-300/90">
                  Transparent per-person pricing, instant booking confirmation, automated itinerary checklist generation, and a flexible 48-hour cancellation policy.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-forest-800 pb-6">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-wider text-brand-400">
                  Field Dispatch: Curated Catalog
                </p>
                <h2 className="mt-2 font-serif text-3xl font-extrabold text-white md:text-4xl">
                  Featured Value Adventures
                </h2>
              </div>
              <Link
                to="/tours"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 hover:text-brand-200 transition-colors"
              >
                <span>View all tours</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : topTours.length > 0 ? (
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {topTours.map((tour) => (
                  <TourCard key={tour._id || tour.id} tour={tour} />
                ))}
              </div>
            ) : (
              <div className="mt-10 rounded-2xl border border-forest-800 bg-forest-900/60 p-12 text-center text-sand-400">
                <p className="font-serif text-lg text-white">No featured tours at the moment.</p>
                <Link to="/tours" className="mt-4 inline-block font-semibold text-brand-400 hover:underline">
                  Browse catalog &rarr;
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto max-w-7xl rounded-3xl border border-forest-700/80 bg-gradient-to-br from-forest-900 via-forest-950 to-forest-900 p-8 md:p-14 shadow-lodge relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="inline-block rounded-md border border-brand-500/40 bg-brand-600/20 px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-brand-300">
                Guide Opportunities
              </span>
              <h2 className="font-serif text-3xl font-extrabold text-white md:text-4xl">
                Share your passion. Host unforgettable adventures.
              </h2>
              <p className="text-sm text-sand-300/90 leading-relaxed">
                Are you an experienced outdoor leader or regional specialist? Join WanderWorld as a verified tour guide,
                publish your own itineraries, and welcome travelers from across the globe.
              </p>
              <div className="pt-3">
                <Link
                  to="/register"
                  className="inline-block rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-bold text-white shadow-glow hover:bg-brand-500 active:scale-95 transition-all"
                >
                  Apply as a Tour Guide
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
