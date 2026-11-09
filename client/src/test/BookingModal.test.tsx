import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { BookingModal } from '../components/bookings/BookingModal';
import { Tour } from '../types';
import * as AuthContextModule from '../contexts/AuthContext';
import { bookingsApi } from '../lib/api';

const mockTour: Tour = {
  _id: 'tour-123',
  title: 'Patagonia Glacier Trek',
  slug: 'patagonia-glacier-trek',
  description: 'Trek across deep blue glaciers.',
  destination: 'Patagonia',
  durationDays: 5,
  price: 1200,
  maxGroupSize: 8,
  difficulty: 'hard',
  images: [],
  ratingsAverage: 5,
  ratingsCount: 10,
  guideId: 'guide-1',
  tags: ['mountains'],
  startDates: ['2025-07-01'],
  isActive: true,
  createdAt: '2025-01-01',
};

describe('BookingModal Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('prompts unauthenticated users to sign in', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    render(
      <BrowserRouter>
        <BookingModal tour={mockTour} isOpen={true} onClose={vi.fn()} />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Please log in or create a traveler account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in to book/i })).toBeInTheDocument();
  });

  it('calculates total price and handles participant increase for logged in traveler', async () => {
    const user = userEvent.setup();

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'u1', name: 'Alice Traveler', email: 'alice@example.com', role: 'traveler' },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    vi.spyOn(bookingsApi, 'createBooking').mockResolvedValue({
      status: 'success',
      data: {
        booking: {
          _id: 'b-999',
          userId: 'u1',
          tourId: mockTour,
          participants: 2,
          totalPrice: 2400,
          status: 'pending',
          stripePaymentIntentId: 'pi_test123',
          createdAt: '2025-01-01',
        },
      },
    });

    render(
      <BrowserRouter>
        <BookingModal tour={mockTour} isOpen={true} onClose={vi.fn()} />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Confirm & Pay \$1,200/i)).toBeInTheDocument();

    const plusButton = screen.getByRole('button', { name: '+' });
    await user.click(plusButton);

    expect(screen.getByText(/Confirm & Pay \$2,400/i)).toBeInTheDocument();

    const submitButton = screen.getByRole('button', { name: /Confirm & Pay \$2,400/i });
    await user.click(submitButton);

    expect(await screen.findByText(/Booking Confirmed!/i)).toBeInTheDocument();
  });
});
