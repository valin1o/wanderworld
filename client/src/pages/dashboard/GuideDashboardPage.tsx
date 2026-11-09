import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toursApi, bookingsApi } from '../../lib/api';
import { Tour, Difficulty, TourTag, Booking } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';

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

export function GuideDashboardPage() {
  const { user } = useAuth();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(500);
  const [durationDays, setDurationDays] = useState<number>(3);
  const [maxGroupSize, setMaxGroupSize] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [tags, setTags] = useState<TourTag[]>(['adventure']);
  const [imageUrl, setImageUrl] = useState('');

  const loadTours = async () => {
    setLoading(true);
    try {
      const res = await toursApi.getAllTours();
      if (res.data?.tours) {
        const myTours = res.data.tours.filter((t) => {
          if (typeof t.guideId === 'object' && t.guideId) {
            return (t.guideId._id || t.guideId.id) === user?.id;
          }
          return t.guideId === user?.id;
        });
        setTours(myTours);
      }
    } catch {
      // Ignore error loading tours
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTours();
  }, [user?.id]);

  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await bookingsApi.getGuideBookings();
      if (res.data?.bookings) setBookings(res.data.bookings);
    } catch {
      // Ignore error loading bookings
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, [user?.id]);

  const handleBookingResponse = async (bookingId: string, action: 'confirm' | 'decline') => {
    if (action === 'decline' && !window.confirm('Are you sure you want to decline this booking?')) return;

    setRespondingId(bookingId);
    setActionAlert(null);
    try {
      if (action === 'confirm') {
        await bookingsApi.confirmBooking(bookingId);
      } else {
        await bookingsApi.declineBooking(bookingId);
      }
      setActionAlert({
        type: 'success',
        message: action === 'confirm' ? 'Booking confirmed.' : 'Booking declined.',
      });
      await loadBookings();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setActionAlert({
        type: 'error',
        message: axiosError.response?.data?.message ?? 'Could not update booking.',
      });
    } finally {
      setRespondingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingTour(null);
    setTitle('');
    setDestination('');
    setDescription('');
    setPrice(500);
    setDurationDays(3);
    setMaxGroupSize(10);
    setDifficulty('medium');
    setTags(['adventure']);
    setImageUrl('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tour: Tour) => {
    setEditingTour(tour);
    setTitle(tour.title);
    setDestination(tour.destination);
    setDescription(tour.description);
    setPrice(tour.price);
    setDurationDays(tour.durationDays);
    setMaxGroupSize(tour.maxGroupSize);
    setDifficulty(tour.difficulty);
    setTags(tour.tags || []);
    setImageUrl(tour.images && tour.images.length > 0 ? tour.images[0] : '');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleTagToggle = (tag: TourTag) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSaveTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !destination || !description) {
      setModalError('Please fill in title, destination, and description.');
      return;
    }

    setModalError(null);
    setModalLoading(true);

    const payload = {
      title,
      destination,
      description,
      price: Number(price),
      durationDays: Number(durationDays),
      maxGroupSize: Number(maxGroupSize),
      difficulty,
      tags,
      images: imageUrl ? [imageUrl] : [],
    };

    try {
      if (editingTour) {
        const id = editingTour._id || (editingTour.id as string);
        await toursApi.updateTour(id, payload);
        setActionAlert({ type: 'success', message: 'Tour updated successfully!' });
      } else {
        await toursApi.createTour(payload);
        setActionAlert({ type: 'success', message: 'Tour created successfully!' });
      }
      setIsModalOpen(false);
      await loadTours();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setModalError(axiosError.response?.data?.message ?? 'Failed to save tour. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteTour = async (tourId: string) => {
    if (!window.confirm('Are you sure you want to delete this tour?')) return;

    try {
      await toursApi.deleteTour(tourId);
      setActionAlert({ type: 'success', message: 'Tour deleted successfully.' });
      await loadTours();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setActionAlert({
        type: 'error',
        message: axiosError.response?.data?.message ?? 'Failed to delete tour.',
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-brand-400">
                Guide Field HQ
              </span>
              <h1 className="mt-1 font-serif text-3xl font-extrabold text-white">Expedition Management</h1>
              <p className="text-xs text-sand-300/80">
                Create and manage your wilderness itineraries, group capacities, and guest bookings.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow hover:bg-brand-500 active:scale-95 transition-all"
            >
              + Create New Expedition
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-5 shadow-card">
              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-sand-400">Active Expeditions</p>
              <p className="mt-2 font-serif text-3xl font-extrabold text-white">{tours.length}</p>
            </div>
            <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-5 shadow-card">
              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-brand-400">Average Rating</p>
              <p className="mt-2 font-serif text-3xl font-extrabold text-brand-400">
                {tours.length > 0
                  ? (tours.reduce((acc, t) => acc + (t.ratingsAverage || 0), 0) / tours.length).toFixed(1)
                  : '5.0'}
              </p>
            </div>
            <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-5 shadow-card">
              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400">Host Status</p>
              <p className="mt-2 text-sm font-bold text-emerald-400">✓ Verified Guide Host</p>
            </div>
          </div>

          {actionAlert && (
            <Alert variant={actionAlert.type} onClose={() => setActionAlert(null)}>
              {actionAlert.message}
            </Alert>
          )}

          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-white">Your Listed Expeditions</h2>

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Spinner size="md" />
              </div>
            ) : tours.length === 0 ? (
              <div className="rounded-2xl border border-forest-800 bg-forest-900/60 p-12 text-center space-y-4 shadow-lodge">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-850 border border-brand-500/30 text-brand-400">
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 2L2 19h20L12 2z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-bold text-white">No tours listed yet</h3>
                <p className="text-sm text-sand-300/80 max-w-md mx-auto">
                  Ready to host travelers? Create your first tour itinerary to start receiving bookings.
                </p>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-brand-500 shadow-glow active:scale-95 transition-all"
                >
                  Create Your First Tour
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tours.map((tour) => {
                  const tourId = tour._id || (tour.id as string);
                  return (
                    <div key={tourId} className="rounded-2xl border border-forest-800/80 bg-forest-900/90 shadow-card overflow-hidden flex flex-col justify-between p-5 space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs text-brand-300 mb-1">
                          <span className="font-mono">📍 {tour.destination}</span>
                          <span className="capitalize font-semibold text-sand-300">{tour.difficulty}</span>
                        </div>
                        <h3 className="font-serif text-lg font-bold text-white">
                          <Link to={`/tours/${tour.slug}`} className="hover:text-brand-300 transition-colors">
                            {tour.title}
                          </Link>
                        </h3>
                        <p className="mt-2 text-xs text-sand-300/80 line-clamp-3 leading-relaxed">{tour.description}</p>
                      </div>

                      <div className="border-t border-forest-800/80 pt-3">
                        <div className="flex justify-between text-xs text-sand-400 mb-3 font-mono">
                          <span>{tour.durationDays} Days</span>
                          <span className="font-bold text-white">${tour.price.toLocaleString()} / person</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(tour)}
                            className="flex-1 rounded-xl border border-forest-700 bg-forest-950 py-2 text-xs font-semibold text-sand-200 hover:border-brand-500 hover:text-white transition-colors"
                          >
                            Edit Tour
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTour(tourId)}
                            className="rounded-xl border border-rose-900/60 bg-rose-950/40 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/60 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-white">Booking Requests</h2>

            {bookingsLoading ? (
              <div className="flex h-24 items-center justify-center">
                <Spinner size="md" />
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-sm text-sand-300/80">No bookings for your tours yet.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => {
                  const bookingId = b._id || (b.id as string);
                  const traveler = typeof b.userId === 'object' ? b.userId : null;
                  return (
                    <div
                      key={bookingId}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-forest-800/80 bg-forest-900/90 p-4 shadow-card"
                    >
                      <div className="space-y-1">
                        <p className="font-serif text-base font-bold text-white">{b.tourId?.title}</p>
                        <p className="text-xs text-sand-300/80">
                          {traveler ? `${traveler.name} (${traveler.email})` : 'Traveler'} · {b.participants}{' '}
                          {b.participants === 1 ? 'guest' : 'guests'} · ${b.totalPrice.toLocaleString()}
                        </p>
                        <p className="text-xs font-mono text-sand-400">
                          Booked {new Date(b.createdAt).toLocaleDateString()}
                          {b.tourDate ? ` · Tour date ${new Date(b.tourDate).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-forest-700 px-2.5 py-0.5 text-xs font-semibold capitalize text-sand-200">
                          {b.status}
                        </span>
                        {b.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              disabled={respondingId === bookingId}
                              onClick={() => handleBookingResponse(bookingId, 'confirm')}
                              className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-500 disabled:opacity-50 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              disabled={respondingId === bookingId}
                              onClick={() => handleBookingResponse(bookingId, 'decline')}
                              className="rounded-xl border border-rose-900/60 bg-rose-950/40 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/60 disabled:opacity-50 transition-colors"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTour ? 'Edit Tour Itinerary' : 'Create New Expedition'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveTour} className="space-y-4">
          {modalError && (
            <Alert variant="error" onClose={() => setModalError(null)}>
              {modalError}
            </Alert>
          )}

          <div>
            <label htmlFor="tour-title" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Tour Title
            </label>
            <input
              id="tour-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Northern Lights & Ice Cave Exploration"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="tour-destination" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Destination / Region
              </label>
              <input
                id="tour-destination"
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Reykjavik, Iceland"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label htmlFor="tour-image" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Cover Image URL
              </label>
              <input
                id="tour-image"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label htmlFor="tour-price" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Price ($)
              </label>
              <input
                id="tour-price"
                type="number"
                min={1}
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label htmlFor="tour-duration" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Duration (Days)
              </label>
              <input
                id="tour-duration"
                type="number"
                min={1}
                required
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label htmlFor="tour-group" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Max Group
              </label>
              <input
                id="tour-group"
                type="number"
                min={1}
                required
                value={maxGroupSize}
                onChange={(e) => setMaxGroupSize(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label htmlFor="tour-difficulty" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Difficulty
              </label>
              <select
                id="tour-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Tags & Experiences
            </label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => {
                const selected = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition-all ${
                      selected
                        ? 'bg-brand-600 text-white shadow-glow'
                        : 'border border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="tour-description" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Tour Description & Itinerary
            </label>
            <textarea
              id="tour-description"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline daily itinerary, highlights, gear requirements, and included amenities..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-brand-500 disabled:opacity-50"
            >
              {modalLoading && <Spinner size="sm" />}
              {modalLoading ? 'Saving...' : editingTour ? 'Update Tour' : 'Publish Tour'}
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
