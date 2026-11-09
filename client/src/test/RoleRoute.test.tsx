import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RoleRoute } from '../components/RoleRoute';
import * as AuthContextModule from '../contexts/AuthContext';

describe('RoleRoute Component', () => {
  it('renders children if user role matches allowed roles', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'g1', name: 'Bob Guide', email: 'bob@example.com', role: 'guide' },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard/guide']}>
        <Routes>
          <Route
            path="/dashboard/guide"
            element={
              <RoleRoute allowedRoles={['guide']}>
                <div>Protected Guide Area</div>
              </RoleRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Protected Guide Area')).toBeInTheDocument();
  });

  it('redirects to home if user role is not allowed', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 't1', name: 'Alice Traveler', email: 'alice@example.com', role: 'traveler' },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard/guide']}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route
            path="/dashboard/guide"
            element={
              <RoleRoute allowedRoles={['guide']}>
                <div>Protected Guide Area</div>
              </RoleRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText('Protected Guide Area')).not.toBeInTheDocument();
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
});
