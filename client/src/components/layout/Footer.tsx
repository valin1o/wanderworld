import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-forest-800/80 bg-forest-950/80 py-14 text-sand-400">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-850 border border-brand-500/40 text-brand-400 font-serif font-black">
                <svg className="h-4 w-4 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 4 15 12 12 20 9 12" fill="currentColor" fillOpacity="0.2" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
              <span className="font-serif text-lg font-bold">
                Wander<span className="text-brand-400 italic">World</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-sand-400 max-w-sm">
              Handcrafted expeditions led by verified local naturalists and mountain guides. Personalized routing powered by watsonx.ai with small group guarantees.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-forest-400">
              <span>📍 HQ: 64°08'42"N 21°56'00"W</span>
              <span>•</span>
              <span>Global Field Units</span>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-sand-200">Adventures</h4>
            <ul className="space-y-2.5 text-xs text-sand-300">
              <li>
                <Link to="/tours" className="hover:text-brand-300 transition-colors">
                  All Expeditions
                </Link>
              </li>
              <li>
                <Link to="/tours?difficulty=easy" className="hover:text-brand-300 transition-colors">
                  Easy Scenic Trails
                </Link>
              </li>
              <li>
                <Link to="/tours?difficulty=hard" className="hover:text-brand-300 transition-colors">
                  High Alpine Expeditions
                </Link>
              </li>
              <li>
                <Link to="/tours?tag=wildlife" className="hover:text-brand-300 transition-colors">
                  Wildlife Safaris
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-sand-200">Guild & Community</h4>
            <ul className="space-y-2.5 text-xs text-sand-300">
              <li>
                <Link to="/register" className="hover:text-brand-300 transition-colors">
                  Join as a Tour Guide
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-300 transition-colors">
                  Host & Leader Portal
                </Link>
              </li>
              <li>
                <Link to="/dashboard/traveler" className="hover:text-brand-300 transition-colors">
                  AI Trip Planner Studio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-sand-200">Field Standards</h4>
            <p className="text-xs leading-relaxed text-sand-400">
              Every host is vetted for wilderness first aid, local licensing, and Leave-No-Trace environmental stewardship.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              <span>100% Certified Local Hosts</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-forest-800/80 pt-6 text-xs text-sand-500 md:flex-row">
          <p>© {new Date().getFullYear()} WanderWorld Expeditions Inc. All rights reserved.</p>
          <div className="mt-4 flex gap-6 md:mt-0 text-sand-400">
            <span className="hover:text-sand-200 cursor-pointer">Privacy Charter</span>
            <span className="hover:text-sand-200 cursor-pointer">Terms of Exploration</span>
            <span className="hover:text-sand-200 cursor-pointer">Leave-No-Trace Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
