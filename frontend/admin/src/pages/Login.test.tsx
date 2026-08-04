import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import Login from './Login';
import { loginAdmin } from '../api/adminApi';
import { showError, showSuccess } from '../utils/toast';
import { renderWithProviders } from '../test/test-utils';

jest.mock('../api/adminApi', () => ({
  loginAdmin: jest.fn(),
}));

jest.mock('../utils/toast', () => ({
  showError: jest.fn(),
  showSuccess: jest.fn(),
}));

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

test('admin login stores token and navigates to dashboard', async () => {
  jest.mocked(loginAdmin).mockResolvedValue({ access_token: 'admin-token' });

  renderWithProviders(
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<p>Dashboard</p>} />
    </Routes>,
    { route: '/login' },
  );

  await userEvent.type(screen.getByLabelText(/^Email/i), 'admin@test.local');
  await userEvent.type(screen.getByLabelText(/^Password/i), 'Admin@123');
  await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

  await waitFor(() => {
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
  expect(localStorage.getItem('admin_token')).toBe('admin-token');
  expect(showSuccess).toHaveBeenCalledWith('Signed in successfully');
});

test('admin login validates required fields', async () => {
  renderWithProviders(
    <Routes>
      <Route path="/login" element={<Login />} />
    </Routes>,
    { route: '/login' },
  );

  await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

  expect(await screen.findByText('Valid email required')).toBeInTheDocument();
  expect(loginAdmin).not.toHaveBeenCalled();
});

test('admin login surfaces API errors', async () => {
  jest.mocked(loginAdmin).mockRejectedValue(new Error('Invalid email or password'));

  renderWithProviders(
    <Routes>
      <Route path="/login" element={<Login />} />
    </Routes>,
    { route: '/login' },
  );

  await userEvent.type(screen.getByLabelText(/^Email/i), 'admin@test.local');
  await userEvent.type(screen.getByLabelText(/^Password/i), 'bad-password');
  await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

  await waitFor(() => {
    expect(showError).toHaveBeenCalled();
  });
});
