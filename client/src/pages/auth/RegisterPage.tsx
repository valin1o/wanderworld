import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'traveler' | 'guide'>('traveler');
  const [error, setError] = useState<string | null>(null);
  const [pendingSuccess, setPendingSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await register({ name, email, password, role });
      if (res.pending) {
        setPendingSuccess(true);
      } else {
        navigate('/dashboard/traveler', { replace: true });
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 w-full max-w-md p-8 shadow-lodge">
          <div className="text-center">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-white">Create an account</h1>
            <p className="mt-2 text-xs font-mono uppercase tracking-wider text-sand-400">
              Join WanderWorld to explore or lead unforgettable expeditions
            </p>
          </div>

          {error && (
            <Alert variant="error" className="mt-6" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {pendingSuccess ? (
            <div className="mt-6 space-y-4">
              <Alert variant="success" title="Application Submitted!">
                Your tour guide account has been created and is pending admin approval. We will review your profile
                promptly.
              </Alert>
              <Link
                to="/login"
                className="block w-full rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-bold text-white shadow-glow hover:bg-brand-500 active:scale-95 transition-all"
              >
                Back to Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="reg-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sand-300">
                  Full name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-forest-700/80 bg-forest-950/90 px-4 py-2.5 text-sm text-sand-100 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder:text-sand-500"
                  placeholder="Alex Morgan"
                />
              </div>

              <div>
                <label htmlFor="reg-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sand-300">
                  Email address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-forest-700/80 bg-forest-950/90 px-4 py-2.5 text-sm text-sand-100 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder:text-sand-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="reg-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sand-300">
                  Password (min. 8 characters)
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-forest-700/80 bg-forest-950/90 px-4 py-2.5 text-sm text-sand-100 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder:text-sand-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="reg-role" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sand-300">
                  I want to join as
                </label>
                <select
                  id="reg-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'traveler' | 'guide')}
                  className="w-full rounded-xl border border-forest-700/80 bg-forest-950/90 px-4 py-2.5 text-sm text-sand-100 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  <option value="traveler">Traveler (Browse, book, and review tours)</option>
                  <option value="guide">Tour Guide (Host & list your own adventures)</option>
                </select>
                {role === 'guide' && (
                  <p className="mt-1.5 text-xs text-amber-400">
                    Guide accounts require verification & admin approval before you can sign in.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-glow transition-all hover:bg-brand-500 active:scale-95 disabled:opacity-50"
              >
                {loading && <Spinner size="sm" />}
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-sand-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
