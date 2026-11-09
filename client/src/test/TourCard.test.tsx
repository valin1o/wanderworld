import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TourCard } from '../components/tours/TourCard';
import { Tour } from '../types';

const mockTour: Tour = {
  _id: 'tour-123',
  title: 'Iceland Glow Adventure',
  slug: 'iceland-glow-adventure',
  description: 'Experience the northern lights and scenic glacier hikes across Iceland.',
  destination: 'Reykjavik, Iceland',
  durationDays: 7,
  price: 1850,
  maxGroupSize: 12,
  difficulty: 'medium',
  images: ['https://example.com/tour.jpg'],
  ratingsAverage: 4.8,
  ratingsCount: 24,
  guideId: { _id: 'guide-1', name: 'Gunnar Host' },
  tags: ['mountains', 'adventure'],
  startDates: ['2025-06-01'],
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
};

describe('TourCard Component', () => {
  it('renders tour title, destination, price, and difficulty badge', () => {
    render(
      <BrowserRouter>
        <TourCard tour={mockTour} />
      </BrowserRouter>,
    );

    expect(screen.getByText('Iceland Glow Adventure')).toBeInTheDocument();
    expect(screen.getByText(/Reykjavik, Iceland/i)).toBeInTheDocument();
    expect(screen.getByText(/\$1,850/i)).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('7 days')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('(24)')).toBeInTheDocument();
    expect(screen.getByText('#mountains')).toBeInTheDocument();
  });

  it('links to the correct tour detail page', () => {
    render(
      <BrowserRouter>
        <TourCard tour={mockTour} />
      </BrowserRouter>,
    );

    const exploreLink = screen.getByRole('link', { name: /explore/i });
    expect(exploreLink).toHaveAttribute('href', '/tours/iceland-glow-adventure');
  });
});
