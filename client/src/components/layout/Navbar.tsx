import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/dashboard/admin';
      case 'guide':
        return '/dashboard/guide';
      case 'traveler':
      default:
        return '/dashboard/traveler';
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-forest-800/80 bg-forest-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link to="/" className="flex items-center gap-3 text-sand-100 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-forest-850 border border-brand-500/40 text-brand-400 font-serif font-black shadow-card transition-all group-hover:border-brand-500">
            <svg
              className="h-5 w-5 text-brand-400 transition-transform group-hover:rotate-45 duration-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="9" />
              <polygon points="12 4 15 12 12 20 9 12" fill="currentColor" fillOpacity="0.2" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-tight text-white">
              Wander<span className="text-brand-400 italic">World</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-forest-300/80 -mt-0.5">
              Field Expeditions
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <Link
            to="/tours"
            className="text-sm font-medium text-sand-200 transition-colors hover:text-brand-300 flex items-center gap-1.5"
          >
            <span>Explore Tours</span>
          </Link>
          <Link
            to="/dashboard/traveler"
            className="text-sm font-medium text-sand-300 transition-colors hover:text-brand-300"
          >
            AI Planner
          </Link>
          {isAuthenticated && (
            <Link
              to={getDashboardPath()}
              className="text-sm font-medium text-sand-200 transition-colors hover:text-brand-300"
            >
              Dashboard
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-3.5 md:flex">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to={getDashboardPath()}
                className="flex items-center gap-2.5 rounded-xl border border-forest-700/80 bg-forest-900/90 px-3.5 py-1.5 text-sm text-sand-200 transition-all hover:border-brand-500/50 hover:bg-forest-850"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-600/30 text-xs font-bold text-brand-400 border border-brand-500/30">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-sand-100">{user.name}</span>
                <span className="rounded bg-forest-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-forest-300">
                  {user.role}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-forest-800 bg-forest-900/60 px-3.5 py-1.5 text-sm font-medium text-sand-300 hover:border-forest-700 hover:text-sand-100 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-sand-200 transition-colors hover:text-white"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:bg-brand-500 active:scale-95"
              >
                Join now
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-sand-300 hover:bg-forest-900 hover:text-white md:hidden"
          aria-label="Toggle navigation menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-b border-forest-800 bg-forest-950 px-6 py-4 md:hidden space-y-3">
          <Link
            to="/tours"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-sand-200 hover:text-white"
          >
            Explore Tours
          </Link>
          <Link
            to="/dashboard/traveler"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-sand-200 hover:text-white"
          >
            AI Trip Planner
          </Link>
          {isAuthenticated && (
            <Link
              to={getDashboardPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-sand-200 hover:text-white"
            >
              Dashboard ({user?.role})
            </Link>
          )}
          <div className="border-t border-forest-800 pt-3">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  void handleLogout();
                }}
                className="w-full rounded-xl bg-forest-800 py-2.5 text-center text-sm font-semibold text-sand-100"
              >
                Sign out
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full rounded-xl border border-forest-700 bg-forest-900 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full rounded-xl bg-brand-600 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Join now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
