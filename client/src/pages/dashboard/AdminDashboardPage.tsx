import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usersApi, bookingsApi, toursApi } from '../../lib/api';
import { User, Booking, UserRole } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'guides' | 'users' | 'bookings'>('guides');

  const [pendingGuides, setPendingGuides] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalTours, setTotalTours] = useState(0);

  const [loading, setLoading] = useState(true);
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [userRoleFilter, setUserRoleFilter] = useState<string>('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [guidesRes, usersRes, bookingsRes, toursRes] = await Promise.all([
        usersApi.getPendingGuides(),
        usersApi.getAllUsers({ role: userRoleFilter || undefined }),
        bookingsApi.getAllBookings({ status: bookingStatusFilter || undefined }),
        toursApi.getAllTours(),
      ]);

      if (guidesRes.data?.guides) setPendingGuides(guidesRes.data.guides);
      if (usersRes.data?.users) setUsers(usersRes.data.users);
      if (bookingsRes.data?.bookings) setBookings(bookingsRes.data.bookings);
      if (toursRes.total !== undefined) setTotalTours(toursRes.total);
    } catch {
      // Ignore load errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAllData();
  }, [userRoleFilter, bookingStatusFilter]);

  const handleApproveGuide = async (guideId: string) => {
    try {
      await usersApi.approveGuide(guideId);
      setActionAlert({ type: 'success', message: 'Guide approved successfully!' });
      await loadAllData();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setActionAlert({
        type: 'error',
        message: axiosError.response?.data?.message ?? 'Failed to approve guide.',
      });
    }
  };

  const handleRejectGuide = async (guideId: string) => {
    if (!window.confirm('Are you sure you want to reject this guide application?')) return;

    try {
      await usersApi.rejectGuide(guideId);
      setActionAlert({ type: 'success', message: 'Guide application rejected.' });
      await loadAllData();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setActionAlert({
        type: 'error',
        message: axiosError.response?.data?.message ?? 'Failed to reject guide.',
      });
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    try {
      await usersApi.changeUserRole(userId, newRole);
      setActionAlert({ type: 'success', message: `User role updated to ${newRole}.` });
      await loadAllData();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setActionAlert({
        type: 'error',
        message: axiosError.response?.data?.message ?? 'Failed to update user role.',
      });
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to deactivate this user account?')) return;

    try {
      await usersApi.deactivateUser(userId);
      setActionAlert({ type: 'success', message: 'User deactivated.' });
      await loadAllData();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setActionAlert({
        type: 'error',
        message: axiosError.response?.data?.message ?? 'Failed to deactivate user.',
      });
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-brand-400">
              Field Operations & Platform Administration
            </span>
            <h1 className="mt-1 font-serif text-3xl font-extrabold text-white">Admin Oversight Dashboard</h1>
            <p className="text-xs text-sand-300/80">
              Manage guide verifications, platform accounts, and system-wide booking activity.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-5 shadow-card">
              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-400">
                Pending Guide Approvals
              </p>
              <p className="mt-2 font-serif text-3xl font-extrabold text-amber-400">{pendingGuides.length}</p>
            </div>
            <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-5 shadow-card">
              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-sand-400">Total Users</p>
              <p className="mt-2 font-serif text-3xl font-extrabold text-white">{users.length}</p>
            </div>
            <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-5 shadow-card">
              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-sand-400">Active Tours</p>
              <p className="mt-2 font-serif text-3xl font-extrabold text-white">{totalTours}</p>
            </div>
            <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-5 shadow-card">
              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400">
                Total Bookings
              </p>
              <p className="mt-2 font-serif text-3xl font-extrabold text-emerald-400">{bookings.length}</p>
            </div>
          </div>

          {actionAlert && (
            <Alert variant={actionAlert.type} onClose={() => setActionAlert(null)}>
              {actionAlert.message}
            </Alert>
          )}

          <div className="flex border-b border-forest-800 gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('guides')}
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === 'guides'
                  ? 'border-brand-500 text-brand-300'
                  : 'border-transparent text-sand-400 hover:text-white'
              }`}
            >
              Pending Guides ({pendingGuides.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === 'users'
                  ? 'border-brand-500 text-brand-300'
                  : 'border-transparent text-sand-400 hover:text-white'
              }`}
            >
              User Management ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === 'bookings'
                  ? 'border-brand-500 text-brand-300'
                  : 'border-transparent text-sand-400 hover:text-white'
              }`}
            >
              Platform Bookings ({bookings.length})
            </button>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : (
            <>
              {activeTab === 'guides' && (
                <div className="space-y-4">
                  {pendingGuides.length === 0 ? (
                    <div className="rounded-2xl border border-forest-800 bg-forest-900/60 p-8 text-center text-sand-400">
                      <p>No pending guide applications at this time.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {pendingGuides.map((guide) => {
                        const guideId = guide.id || (guide as { _id?: string })._id || '';
                        return (
                          <div
                            key={guideId}
                            className="rounded-2xl border border-forest-800/80 bg-forest-900/90 p-6 flex flex-col justify-between space-y-4 shadow-card"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-xl font-serif font-bold text-amber-400 border border-amber-500/30">
                                {guide.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-serif font-bold text-white text-lg">{guide.name}</h3>
                                <p className="text-xs font-mono text-sand-400">{guide.email}</p>
                                <span className="inline-block rounded bg-amber-950/70 px-2 py-0.5 text-[11px] font-semibold text-amber-300 border border-amber-800/70">
                                  Pending Verification
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-forest-800">
                              <button
                                type="button"
                                onClick={() => handleApproveGuide(guideId)}
                                className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-all active:scale-95"
                              >
                                Approve Guide
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectGuide(guideId)}
                                className="rounded-xl border border-rose-900/60 bg-rose-950/40 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/60 transition-all active:scale-95"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <label htmlFor="filter-user-role" className="text-xs font-mono text-sand-400 font-semibold uppercase">Filter by Role:</label>
                      <select
                        id="filter-user-role"
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="rounded-xl border border-forest-700 bg-forest-950 px-3 py-1.5 text-xs text-sand-100 outline-none"
                      >
                        <option value="">All Roles</option>
                        <option value="traveler">Traveler</option>
                        <option value="guide">Guide</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 shadow-card overflow-x-auto">
                    <table className="w-full text-left text-sm text-sand-200">
                      <thead className="border-b border-forest-800 bg-forest-950/80 text-xs font-mono uppercase tracking-wider text-sand-400">
                        <tr>
                          <th className="px-6 py-3.5">User</th>
                          <th className="px-6 py-3.5">Email</th>
                          <th className="px-6 py-3.5">Role</th>
                          <th className="px-6 py-3.5">Status</th>
                          <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-forest-800">
                        {users.map((u) => {
                          const uId = u.id || (u as { _id?: string })._id || '';
                          return (
                            <tr key={uId} className="hover:bg-forest-850/50 transition-colors">
                              <td className="px-6 py-4 font-semibold text-white">{u.name}</td>
                              <td className="px-6 py-4 text-xs font-mono text-sand-400">{u.email}</td>
                              <td className="px-6 py-4">
                                <select
                                  value={u.role}
                                  onChange={(e) => handleChangeRole(uId, e.target.value as UserRole)}
                                  className="rounded-lg border border-forest-700 bg-forest-950 px-2 py-1 text-xs text-sand-200 outline-none"
                                >
                                  <option value="traveler">traveler</option>
                                  <option value="guide">guide</option>
                                  <option value="admin">admin</option>
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    u.isActive !== false
                                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/70'
                                      : 'bg-rose-950/70 text-rose-300 border border-rose-800/70'
                                  }`}
                                >
                                  {u.isActive !== false ? 'Active' : 'Deactivated'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {u.isActive !== false && u.id !== user?.id && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeactivateUser(uId)}
                                    className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:underline"
                                  >
                                    Deactivate
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label htmlFor="filter-booking-status" className="text-xs font-mono text-sand-400 font-semibold uppercase">Filter by Status:</label>
                    <select
                      id="filter-booking-status"
                      value={bookingStatusFilter}
                      onChange={(e) => setBookingStatusFilter(e.target.value)}
                      className="rounded-xl border border-forest-700 bg-forest-950 px-3 py-1.5 text-xs text-sand-100 outline-none"
                    >
                      <option value="">All Statuses</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 shadow-card overflow-x-auto">
                    <table className="w-full text-left text-sm text-sand-200">
                      <thead className="border-b border-forest-800 bg-forest-950/80 text-xs font-mono uppercase tracking-wider text-sand-400">
                        <tr>
                          <th className="px-6 py-3.5">Traveler</th>
                          <th className="px-6 py-3.5">Tour Title</th>
                          <th className="px-6 py-3.5">Participants</th>
                          <th className="px-6 py-3.5">Total Price</th>
                          <th className="px-6 py-3.5">Status</th>
                          <th className="px-6 py-3.5">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {bookings.map((b) => {
                          const bId = b._id || (b.id as string);
                          const travelerName =
                            typeof b.userId === 'object' && b.userId ? b.userId.name : 'Traveler';
                          const tourTitle =
                            typeof b.tourId === 'object' && b.tourId ? b.tourId.title : 'Tour';

                          return (
                            <tr key={bId} className="hover:bg-slate-800/30">
                              <td className="px-6 py-4 font-medium text-white">{travelerName}</td>
                              <td className="px-6 py-4 text-slate-300">{tourTitle}</td>
                              <td className="px-6 py-4 text-slate-400">{b.participants}</td>
                              <td className="px-6 py-4 font-semibold text-white">
                                ${b.totalPrice?.toLocaleString()}
                              </td>
                              <td className="px-6 py-4">{statusBadge(b.status)}</td>
                              <td className="px-6 py-4 text-xs text-slate-500">
                                {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
