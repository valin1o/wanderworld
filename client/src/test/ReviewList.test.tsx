import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewList } from '../components/reviews/ReviewList';
import { Review } from '../types';

const mockReviews: Review[] = [
  {
    _id: 'rev-1',
    userId: { _id: 'u1', name: 'John Doe' },
    tourId: 'tour-123',
    rating: 5,
    comment: 'Spectacular experience from start to finish! The guide was extremely knowledgeable.',
    helpfulCount: 3,
    createdAt: '2025-01-15T12:00:00.000Z',
  },
  {
    _id: 'rev-2',
    userId: { _id: 'u2', name: 'Sarah Smith' },
    tourId: 'tour-123',
    rating: 4,
    comment: 'Great trail conditions and stunning vistas along the valley path.',
    helpfulCount: 1,
    createdAt: '2025-01-10T12:00:00.000Z',
  },
];

describe('ReviewList Component', () => {
  it('renders reviews with author names, comments, and ratings average', () => {
    render(<ReviewList reviews={mockReviews} ratingsAverage={4.5} ratingsCount={2} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/Spectacular experience/i)).toBeInTheDocument();
    expect(screen.getByText('Sarah Smith')).toBeInTheDocument();
    expect(screen.getByText(/Great trail conditions/i)).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('2 reviews')).toBeInTheDocument();
  });

  it('renders empty message when no reviews exist', () => {
    render(<ReviewList reviews={[]} ratingsAverage={0} ratingsCount={0} />);

    expect(screen.getByText(/No reviews yet/i)).toBeInTheDocument();
  });
});
