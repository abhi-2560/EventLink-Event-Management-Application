import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import OrganizerLogin from '@organizer/pages/Login';
import { loginOrganizer } from '@organizer/api/authApi';
import { showError, showSuccess } from '@shared/utils/toast';
import { renderWithProviders } from '@shared/test/test-utils';

jest.mock('@organizer/api/authApi', () => ({
  loginOrganizer: jest.fn(),
}));

jest.mock('@shared/utils/toast', () => ({
  showError: jest.fn(),
  showSuccess: jest.fn(),
}));

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

test('organizer login stores token and navigates to dashboard', async () => {
  jest.mocked(loginOrganizer).mockResolvedValue({ access_token: 'organizer-token' });

  renderWithProviders(
    <Routes>
      <Route path="/organizer/login" element={<OrganizerLogin />} />
      <Route path="/organizer/dashboard" element={<p>Dashboard</p>} />
    </Routes>,
    { route: '/organizer/login' },
  );

  const form = screen.getByRole('button', { name: 'Sign In' }).closest('form')!;

  await userEvent.type(form.querySelector('input[type="email"]')!, 'organizer@test.local');
  await userEvent.type(form.querySelector('input[type="password"]')!, 'Organizer@123');
  await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

  await waitFor(() => {
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
  expect(localStorage.getItem('organizer_token')).toBe('organizer-token');
  expect(showSuccess).toHaveBeenCalledWith('Signed in successfully');
});

test('organizer login shows API errors', async () => {
  jest.mocked(loginOrganizer).mockRejectedValue(new Error('Invalid email or password'));

  renderWithProviders(
    <Routes>
      <Route path="/organizer/login" element={<OrganizerLogin />} />
    </Routes>,
    { route: '/organizer/login' },
  );

  const form = screen.getByRole('button', { name: 'Sign In' }).closest('form')!;

  await userEvent.type(form.querySelector('input[type="email"]')!, 'organizer@test.local');
  await userEvent.type(form.querySelector('input[type="password"]')!, 'bad-password');
  await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

  await waitFor(() => {
    expect(showError).toHaveBeenCalled();
  });
  expect(localStorage.getItem('organizer_token')).toBeNull();
});
