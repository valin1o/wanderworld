import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../lib/api';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: { email: string; password: string }) => Promise<User>;
  register: (userData: { name: string; email: string; password: string; role?: 'traveler' | 'guide' }) => Promise<{ pending?: boolean; user?: User }>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeUser(rawUser: unknown): User | null {
  if (!rawUser || typeof rawUser !== 'object') return null;
  const u = rawUser as Record<string, unknown>;
  const id = String(u.id || u._id || '');
  if (!id) return null;
  return {
    ...(rawUser as User),
    id,
    _id: id,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('wanderworld_user');
    if (saved) {
      try {
        return normalizeUser(JSON.parse(saved));
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('wanderworld_access_token');
      if (token) {
        try {
          const res = await authApi.getMe();
          const normalized = normalizeUser(res.data?.user);
          if (normalized) {
            setUser(normalized);
            localStorage.setItem('wanderworld_user', JSON.stringify(normalized));
          }
        } catch {
          try {
            const refreshRes = await authApi.refresh();
            const refreshedUser = normalizeUser(
              refreshRes.user || (refreshRes as unknown as { data?: { user?: User } }).data?.user,
            );
            const refreshedToken =
              refreshRes.accessToken ||
              (refreshRes as unknown as { data?: { accessToken?: string } }).data?.accessToken;

            if (refreshedUser && refreshedToken) {
              localStorage.setItem('wanderworld_access_token', refreshedToken);
              localStorage.setItem('wanderworld_user', JSON.stringify(refreshedUser));
              setUser(refreshedUser);
            } else {
              localStorage.removeItem('wanderworld_access_token');
              localStorage.removeItem('wanderworld_user');
              setUser(null);
            }
          } catch {
            localStorage.removeItem('wanderworld_access_token');
            localStorage.removeItem('wanderworld_user');
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    }

    void initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await authApi.login(credentials);
    const loggedUser = normalizeUser(
      res.user || (res as unknown as { data?: { user?: User } }).data?.user,
    );
    const token =
      res.accessToken ||
      (res as unknown as { data?: { accessToken?: string } }).data?.accessToken;

    if (!loggedUser || !token) {
      throw new Error('Invalid login response from server');
    }

    localStorage.setItem('wanderworld_access_token', token);
    localStorage.setItem('wanderworld_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (userData: { name: string; email: string; password: string; role?: 'traveler' | 'guide' }) => {
    const res = await authApi.register(userData);
    if (res.status === 'pending') {
      return { pending: true };
    }

    const registeredUser = res.user || (res as unknown as { data?: { user?: User } }).data?.user;
    const token = res.accessToken || (res as unknown as { data?: { accessToken?: string } }).data?.accessToken;

    if (registeredUser && token) {
      localStorage.setItem('wanderworld_access_token', token);
      localStorage.setItem('wanderworld_user', JSON.stringify(registeredUser));
      setUser(registeredUser);
      return { user: registeredUser };
    }

    return {};
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('wanderworld_access_token');
      localStorage.removeItem('wanderworld_user');
      setUser(null);
    }
  };

  const updateUser = (updated: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      localStorage.setItem('wanderworld_user', JSON.stringify(next));
      return next;
    });
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateUser,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
