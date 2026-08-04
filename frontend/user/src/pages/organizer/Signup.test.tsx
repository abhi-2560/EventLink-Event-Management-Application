import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import OrganizerSignup from './Signup';
import { registerOrganizer } from '../../api/authApi';
import { showError, showSuccess } from '../../utils/toast';
import { renderWithProviders } from '../../test/test-utils';

jest.mock('../../api/authApi', () => ({
  registerOrganizer: jest.fn(),
}));

jest.mock('../../utils/toast', () => ({
  showError: jest.fn(),
  showSuccess: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('organizer signup validates required fields', async () => {
  renderWithProviders(
    <Routes>
      <Route path="/organizer/signup" element={<OrganizerSignup />} />
    </Routes>,
    { route: '/organizer/signup' },
  );

  await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

  expect(await screen.findByText('Organization name is required')).toBeInTheDocument();
  expect(registerOrganizer).not.toHaveBeenCalled();
});

test('organizer signup creates account and redirects to login', async () => {
  jest.mocked(registerOrganizer).mockResolvedValue({ organizer_id: 'org-new' });

  renderWithProviders(
    <Routes>
      <Route path="/organizer/signup" element={<OrganizerSignup />} />
      <Route path="/organizer/login" element={<p>Login page</p>} />
    </Routes>,
    { route: '/organizer/signup' },
  );

  await userEvent.type(screen.getByLabelText(/^Organizer Name/i), 'New Org');
  await userEvent.type(screen.getByLabelText(/^Contact Person/i), 'Jane Doe');
  await userEvent.type(screen.getByLabelText(/^Email/i), 'new@test.local');
  await userEvent.type(screen.getByLabelText(/^Phone Number/i), '9876543210');
  await userEvent.type(screen.getByLabelText(/^Password/i), 'Organizer@123');
  await userEvent.type(screen.getByLabelText(/^Confirm Password/i), 'Organizer@123');
  await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

  await waitFor(() => {
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });
  expect(jest.mocked(registerOrganizer).mock.calls[0][0]).toEqual(
    expect.objectContaining({
      organizer_name: 'New Org',
      email: 'new@test.local',
    }),
  );
  expect(showSuccess).toHaveBeenCalledWith('Account created successfully');
});

test('organizer signup surfaces API errors', async () => {
  jest.mocked(registerOrganizer).mockRejectedValue(new Error('Email already registered'));

  renderWithProviders(
    <Routes>
      <Route path="/organizer/signup" element={<OrganizerSignup />} />
    </Routes>,
    { route: '/organizer/signup' },
  );

  await userEvent.type(screen.getByLabelText(/^Organizer Name/i), 'New Org');
  await userEvent.type(screen.getByLabelText(/^Contact Person/i), 'Jane Doe');
  await userEvent.type(screen.getByLabelText(/^Email/i), 'existing@test.local');
  await userEvent.type(screen.getByLabelText(/^Phone Number/i), '9876543210');
  await userEvent.type(screen.getByLabelText(/^Password/i), 'Organizer@123');
  await userEvent.type(screen.getByLabelText(/^Confirm Password/i), 'Organizer@123');
  await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

  await waitFor(() => {
    expect(showError).toHaveBeenCalled();
  });
});
