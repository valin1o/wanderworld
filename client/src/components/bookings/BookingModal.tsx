import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tour } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { bookingsApi } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';

interface BookingModalProps {
  tour: Tour;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ tour, isOpen, onClose }: BookingModalProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [participants, setParticipants] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>(
    tour.startDates && tour.startDates.length > 0 ? tour.startDates[0] : '',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const totalPrice = tour.price * participants;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setError(null);
    setLoading(true);

    try {
      const tourId = tour._id || (tour.id as string);
      const res = await bookingsApi.createBooking({
        tourId,
        participants,
        tourDate: selectedDate || undefined,
      });

      if (res.data?.booking) {
        setBookingId(res.data.booking._id || (res.data.booking.id as string));
        setBookingSuccess(true);
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message ?? 'Failed to complete booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDashboard = () => {
    onClose();
    navigate('/dashboard/traveler');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book Your Adventure">
      {!isAuthenticated ? (
        <div className="space-y-4 py-2">
          <p className="text-slate-300">
            Please log in or create a traveler account to book{' '}
            <span className="font-semibold text-white">{tour.title}</span>.
          </p>
          <div className="flex gap-3 pt-2">
            <Link
              to="/login"
              className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-center text-xs font-bold text-white shadow-glow hover:bg-brand-500 active:scale-95 transition-all"
            >
              Sign in to Book
            </Link>
            <Link
              to="/register"
              className="flex-1 rounded-xl border border-forest-700 bg-forest-950 px-4 py-2.5 text-center text-xs font-semibold text-sand-200 hover:border-brand-500 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      ) : bookingSuccess ? (
        <div className="space-y-5 py-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-2xl text-emerald-400 border border-emerald-500/30">
            ✓
          </div>
          <div>
            <h4 className="font-serif text-2xl font-bold text-white">Booking Confirmed!</h4>
            <p className="mt-2 text-sm text-sand-200">
              You are booked for <span className="text-white font-medium">{tour.title}</span> for {participants}{' '}
              {participants === 1 ? 'traveler' : 'travelers'}.
            </p>
            {bookingId && (
              <p className="mt-1 text-xs text-sand-400 font-mono">Reference: {bookingId}</p>
            )}
          </div>
          <Alert variant="success">
            A confirmation receipt and detailed packing checklist have been added to your dashboard.
          </Alert>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleViewDashboard}
              className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-500 active:scale-95 transition-all shadow-glow"
            >
              Go to Dashboard
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-forest-700 px-4 py-2.5 text-xs font-semibold text-sand-300 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleBooking} className="space-y-5">
          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <div className="rounded-xl border border-forest-800 bg-forest-950 p-4">
            <h4 className="font-serif font-bold text-white text-base">{tour.title}</h4>
            <p className="text-xs font-mono text-sand-400 mt-0.5">
              📍 {tour.destination} • {tour.durationDays} days • Max group {tour.maxGroupSize}
            </p>
            <p className="mt-2 text-sm font-bold text-brand-400">
              ${tour.price.toLocaleString()} <span className="text-xs text-sand-400 font-normal">/ person</span>
            </p>
          </div>

          <div>
            <label htmlFor="booking-date" className="block text-xs font-mono font-semibold uppercase tracking-wider text-sand-300 mb-1.5">
              Departure Date
            </label>
            {tour.startDates && tour.startDates.length > 0 ? (
              <select
                id="booking-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border border-forest-700/80 bg-forest-950 px-3.5 py-2.5 text-sm text-sand-100 outline-none focus:border-brand-500"
              >
                {tour.startDates.map((dateStr) => (
                  <option key={dateStr} value={dateStr}>
                    {new Date(dateStr).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="booking-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border border-forest-700/80 bg-forest-950 px-3.5 py-2.5 text-sm text-sand-100 outline-none focus:border-brand-500"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-sand-300 mb-1.5">
              Participants (Max: {tour.maxGroupSize})
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setParticipants(Math.max(1, participants - 1))}
                disabled={participants <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-forest-700 bg-forest-950 text-lg font-bold text-sand-200 hover:border-brand-500 disabled:opacity-40 transition-colors"
              >
                -
              </button>
              <span className="w-12 text-center text-lg font-bold text-white">{participants}</span>
              <button
                type="button"
                onClick={() => setParticipants(Math.min(tour.maxGroupSize, participants + 1))}
                disabled={participants >= tour.maxGroupSize}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-forest-700 bg-forest-950 text-lg font-bold text-sand-200 hover:border-brand-500 disabled:opacity-40 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-forest-800 bg-forest-950/80 p-4 space-y-2">
            <div className="flex justify-between text-xs text-sand-400">
              <span>
                ${tour.price.toLocaleString()} × {participants} {participants === 1 ? 'traveler' : 'travelers'}
              </span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-forest-800 pt-2 font-bold text-white">
              <span>Total Amount</span>
              <span className="font-serif text-brand-400 text-lg">${totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-glow hover:bg-brand-500 active:scale-95 disabled:opacity-50 transition-all"
          >
            {loading && <Spinner size="sm" />}
            {loading ? 'Processing payment...' : `Confirm & Pay $${totalPrice.toLocaleString()}`}
          </button>
        </form>
      )}
    </Modal>
  );
}
