import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const user = await login({ email, password });
      if (from) {
        navigate(from, { replace: true });
      } else {
        switch (user.role) {
          case 'admin':
            navigate('/dashboard/admin', { replace: true });
            break;
          case 'guide':
            navigate('/dashboard/guide', { replace: true });
            break;
          case 'traveler':
          default:
            navigate('/dashboard/traveler', { replace: true });
            break;
        }
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message ?? 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role: 'traveler' | 'guide' | 'admin') => {
    if (role === 'traveler') {
      setEmail('alice@example.com');
      setPassword('SecurePass123!');
    } else if (role === 'guide') {
      setEmail('bob@example.com');
      setPassword('SecurePass123!');
    } else {
      setEmail('admin@example.com');
      setPassword('SecurePass123!');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="rounded-2xl border border-forest-800/80 bg-forest-900/90 w-full max-w-md p-8 shadow-lodge">
          <div className="text-center">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="mt-2 text-xs font-mono uppercase tracking-wider text-sand-400">
              Sign in to your WanderWorld account
            </p>
          </div>

          {error && (
            <Alert variant="error" className="mt-6" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sand-300">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-forest-700/80 bg-forest-950/90 px-4 py-2.5 text-sm text-sand-100 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder:text-sand-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sand-300">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-forest-700/80 bg-forest-950/90 px-4 py-2.5 text-sm text-sand-100 outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder:text-sand-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-glow transition-all hover:bg-brand-500 active:scale-95 disabled:opacity-50"
            >
              {loading && <Spinner size="sm" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 border-t border-forest-800 pt-5">
            <p className="text-xs font-mono text-sand-400 mb-2.5">Quick fill demo accounts:</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('traveler')}
                className="flex-1 rounded-xl border border-forest-700 bg-forest-950/80 px-2 py-1.5 text-xs font-semibold text-sand-300 hover:border-brand-500 hover:text-white transition-colors"
              >
                Traveler
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('guide')}
                className="flex-1 rounded-xl border border-forest-700 bg-forest-950/80 px-2 py-1.5 text-xs font-semibold text-sand-300 hover:border-brand-500 hover:text-white transition-colors"
              >
                Guide
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin')}
                className="flex-1 rounded-xl border border-forest-700 bg-forest-950/80 px-2 py-1.5 text-xs font-semibold text-sand-300 hover:border-brand-500 hover:text-white transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-sand-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 underline underline-offset-2">
              Create an account
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
