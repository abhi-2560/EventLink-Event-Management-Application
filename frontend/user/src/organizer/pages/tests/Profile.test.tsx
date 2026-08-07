import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrganizerProfile from '@organizer/pages/Profile';
import { changePassword, getProfile, updateProfile } from '@organizer/api/organizerApi';
import { renderWithProviders } from '@shared/test/test-utils';

jest.mock('@organizer/api/organizerApi', () => ({
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
}));

const profile = {
  id: 'org-1',
  organizer_name: 'Test Organizer',
  contact_person: 'Test Contact',
  email: 'organizer@test.local',
  phone: '9876543210',
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getProfile).mockResolvedValue(profile);
});

test('loads organizer profile details', async () => {
  renderWithProviders(<OrganizerProfile />, { token: 'organizer-token' });

  expect(await screen.findByDisplayValue('Test Organizer')).toBeInTheDocument();
  expect(screen.getByDisplayValue('organizer@test.local')).toBeDisabled();
});

test('updates organizer profile details', async () => {
  jest.mocked(updateProfile).mockResolvedValue({ ...profile, organizer_name: 'Updated Organizer' });

  renderWithProviders(<OrganizerProfile />, { token: 'organizer-token' });
  await screen.findByDisplayValue('Test Organizer');

  const nameInput = screen.getByLabelText('Organization name');
  await userEvent.clear(nameInput);
  await userEvent.type(nameInput, 'Updated Organizer');
  await userEvent.click(screen.getByRole('button', { name: 'Save Profile' }));

  await waitFor(() => {
    expect(jest.mocked(updateProfile).mock.calls[0][0]).toEqual(expect.objectContaining({ organizer_name: 'Updated Organizer' }));
  });
  expect(await screen.findByText('Profile updated.')).toBeInTheDocument();
});

test('changes organizer password', async () => {
  jest.mocked(changePassword).mockResolvedValue({ message: 'Password updated' });

  renderWithProviders(<OrganizerProfile />, { token: 'organizer-token' });
  await screen.findByDisplayValue('Test Organizer');

  await userEvent.type(screen.getByLabelText('Current password'), 'Organizer@123');
  await userEvent.type(screen.getByLabelText('New password'), 'Organizer@456');
  await userEvent.type(screen.getByLabelText('Confirm password'), 'Organizer@456');
  await userEvent.click(screen.getByRole('button', { name: 'Update Password' }));

  await waitFor(() => {
    expect(jest.mocked(changePassword).mock.calls[0]).toEqual(['Organizer@123', 'Organizer@456']);
  });
  expect(await screen.findByText('Password updated.')).toBeInTheDocument();
});
