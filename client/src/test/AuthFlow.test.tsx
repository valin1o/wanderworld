import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import * as AuthContextModule from '../contexts/AuthContext';

describe('Auth Flow Pages', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('LoginPage', () => {
    it('renders login form and submits credentials', async () => {
      const user = userEvent.setup();
      const mockLogin = vi.fn().mockResolvedValue({ id: '1', role: 'traveler' });

      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        login: mockLogin,
        register: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn(),
      });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>,
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /^sign in$/i });

      await user.type(emailInput, 'alice@example.com');
      await user.type(passwordInput, 'SecurePass123!');
      await user.click(submitButton);

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'alice@example.com',
        password: 'SecurePass123!',
      });
    });

    it('populates demo credentials when clicking quick fill buttons', async () => {
      const user = userEvent.setup();
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
          <LoginPage />
        </BrowserRouter>,
      );

      const guideDemoBtn = screen.getByRole('button', { name: /^guide$/i });
      await user.click(guideDemoBtn);

      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      expect(emailInput.value).toBe('bob@example.com');
    });
  });

  describe('RegisterPage', () => {
    it('shows pending guide notification when registering as guide', async () => {
      const user = userEvent.setup();
      const mockRegister = vi.fn().mockResolvedValue({ pending: true });

      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        login: vi.fn(),
        register: mockRegister,
        logout: vi.fn(),
        updateUser: vi.fn(),
      });

      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>,
      );

      await user.type(screen.getByLabelText(/full name/i), 'Bob Guide');
      await user.type(screen.getByLabelText(/email address/i), 'bob@example.com');
      await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
      await user.selectOptions(screen.getByLabelText(/i want to join as/i), 'guide');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Bob Guide',
        email: 'bob@example.com',
        password: 'SecurePass123!',
        role: 'guide',
      });

      expect(await screen.findByText(/Application Submitted!/i)).toBeInTheDocument();
    });
  });
});
