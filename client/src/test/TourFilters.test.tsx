import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TourFilters, TourFilterState } from '../components/tours/TourFilters';

describe('TourFilters Component', () => {
  const initialFilters: TourFilterState = {
    search: '',
    difficulty: '',
    tag: '',
    sort: 'featured',
  };

  it('handles search input changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleReset = vi.fn();

    render(<TourFilters filters={initialFilters} onChange={handleChange} onReset={handleReset} />);

    const searchInput = screen.getByPlaceholderText(/e\.g\. Iceland/i);
    await user.type(searchInput, 'Alps');

    expect(handleChange).toHaveBeenCalled();
  });

  it('handles difficulty dropdown changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleReset = vi.fn();

    render(<TourFilters filters={initialFilters} onChange={handleChange} onReset={handleReset} />);

    const select = screen.getByLabelText(/difficulty/i);
    await user.selectOptions(select, 'hard');

    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ difficulty: 'hard' }));
  });

  it('allows clicking tag pills to filter and clicking reset', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleReset = vi.fn();

    const activeFilters: TourFilterState = {
      search: 'Patagonia',
      difficulty: 'hard',
      tag: 'mountains',
      sort: 'featured',
    };

    render(<TourFilters filters={activeFilters} onChange={handleChange} onReset={handleReset} />);

    const mountainsButton = screen.getByRole('button', { name: /^mountains$/i });
    expect(mountainsButton).toHaveClass('bg-brand-600');

    const resetButton = screen.getByRole('button', { name: /reset all filters/i });
    await user.click(resetButton);

    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
