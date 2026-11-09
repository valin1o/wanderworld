import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookingsApi } from '../../lib/api';
import { Booking } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { AiTripPlanner } from '../../components/ai/AiTripPlanner';

export function TravelerDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'ai-planner' | 'profile'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingsApi.getMyBookings();
      if (res.data?.bookings) {
        setBookings(res.data.bookings);
      }
    } catch {
      // Ignore error loading bookings
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    setCancellingId(bookingId);
    setActionAlert(null);

    try {
      const res = await bookingsApi.cancelBooking(bookingId);
      if (res.data?.booking) {
        const isRefunded = res.data.booking.status === 'refunded';
        setActionAlert({
          type: 'success',
          message: isRefunded
            ? 'Booking cancelled and full refund initiated.'
            : 'Booking successfully cancelled.',
        });
        await loadBookings();
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setActionAlert({
        type: 'error',
        message: axiosError.response?.data?.message ?? 'Could not cancel booking.',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/70',
      pending: 'bg-amber-950/70 text-amber-300 border-amber-800/70',
      cancelled: 'bg-forest-950 text-sand-400 border-forest-800',
      refunded: 'bg-forest-850 text-sand-300 border-forest-700',
    };
    return (
      <span
        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
          styles[status] || styles.pending
        }`}
      >
        {status}
      </span>
    );
  };

  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-brand-400">
                Traveler Field Portal
              </span>
              <h1 className="mt-1 font-serif text-3xl font-extrabold text-white">Welcome back, {user?.name}</h1>
              <p className="text-xs text-sand-300/80">Manage your trips, itineraries, and AI travel blueprints</p>
            </div>
            <Link
              to="/tours"
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow hover:bg-brand-500 active:scale-95 transition-all"
            >
              + Explore New Tours
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-5 shadow-card">
              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-sand-400">Total Bookings</p>
              <p className="mt-2 font-serif text-3xl font-extrabold text-white">{bookings.length}</p>
            </div>
            <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-5 shadow-card">
              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400">Confirmed Adventures</p>
              <p className="mt-2 font-serif text-3xl font-extrabold text-emerald-400">{confirmedCount}</p>
            </div>
            <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-5 shadow-card">
              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-400">Pending Requests</p>
              <p className="mt-2 font-serif text-3xl font-extrabold text-amber-400">{pendingCount}</p>
            </div>
          </div>

          <div className="flex border-b border-forest-800 gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === 'bookings'
                  ? 'border-brand-500 text-brand-300'
                  : 'border-transparent text-sand-400 hover:text-white'
              }`}
            >
              My Bookings ({bookings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ai-planner')}
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === 'ai-planner'
                  ? 'border-brand-500 text-brand-300'
                  : 'border-transparent text-sand-400 hover:text-white'
              }`}
            >
              ✨ AI Trip Planner
            </button>
          </div>

          {actionAlert && (
            <Alert variant={actionAlert.type} onClose={() => setActionAlert(null)}>
              {actionAlert.message}
            </Alert>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex h-48 items-center justify-center">
                  <Spinner size="md" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="rounded-2xl border border-forest-800 bg-forest-900/60 p-12 text-center space-y-4 shadow-lodge">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-850 border border-brand-500/30 text-brand-400">
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-white">No bookings yet</h3>
                  <p className="text-sm text-sand-300/80 max-w-md mx-auto">
                    You haven't booked any expeditions yet. Explore our curated tours or use the AI planner to find your next journey!
                  </p>
                  <Link
                    to="/tours"
                    className="inline-block rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-brand-500 shadow-glow active:scale-95 transition-all"
                  >
                    Browse Expeditions
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const bId = booking._id || (booking.id as string);
                    const tour = booking.tourId;
                    const canCancel = ['pending', 'confirmed'].includes(booking.status);

                    return (
                      <div
                        key={bId}
                        className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-card"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          {tour?.images && tour.images.length > 0 ? (
                            <img
                              src={tour.images[0]}
                              alt={tour.title}
                              className="h-20 w-28 shrink-0 rounded-xl object-cover border border-forest-800"
                            />
                          ) : (
                            <div className="h-20 w-28 shrink-0 rounded-xl bg-forest-950 flex items-center justify-center text-forest-400 text-xs font-mono">
                              No Image
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {statusBadge(booking.status)}
                              {tour?.destination && (
                                <span className="text-xs font-mono text-brand-300">📍 {tour.destination}</span>
                              )}
                            </div>

                            <h3 className="font-serif text-lg font-bold text-white">
                              {tour?.slug ? (
                                <Link to={`/tours/${tour.slug}`} className="hover:text-brand-300 transition-colors">
                                  {tour.title}
                                </Link>
                              ) : (
                                tour?.title ?? 'Adventure Tour'
                              )}
                            </h3>

                            <p className="text-xs text-sand-300/80">
                              Booked for {booking.participants}{' '}
                              {booking.participants === 1 ? 'traveler' : 'travelers'} • Total:{' '}
                              <span className="font-semibold text-white">
                                ${booking.totalPrice?.toLocaleString()}
                              </span>
                            </p>

                            {booking.tourDate && (
                              <p className="text-[11px] font-mono text-sand-400">
                                Departure: {new Date(booking.tourDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t border-forest-800 md:border-0 pt-4 md:pt-0">
                          {tour?.slug && (
                            <Link
                              to={`/tours/${tour.slug}`}
                              className="rounded-xl border border-forest-700 bg-forest-950 px-4 py-2 text-xs font-bold text-sand-100 hover:border-brand-500 hover:text-white transition-colors"
                            >
                              View Tour
                            </Link>
                          )}

                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => handleCancelBooking(bId)}
                              disabled={cancellingId === bId}
                              className="rounded-xl border border-rose-900/60 bg-rose-950/40 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/60 disabled:opacity-50 transition-colors"
                            >
                              {cancellingId === bId ? 'Cancelling...' : 'Cancel Booking'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai-planner' && (
            <div>
              <AiTripPlanner />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
