import { screen } from '@testing-library/react';
import OrganizerEvents from '@organizer/pages/Events';
import { getEvents } from '@organizer/api/organizerApi';
import { mockEvent } from '@shared/test/fixtures';
import { renderWithProviders } from '@shared/test/test-utils';

jest.mock('@organizer/api/organizerApi', () => ({
  getEvents: jest.fn(),
}));

jest.mock('@organizer/pages/CreateEvent', () => () => null);

beforeEach(() => {
  jest.clearAllMocks();
});

test('shows empty state when organizer has no events', async () => {
  jest.mocked(getEvents).mockResolvedValue([]);
  renderWithProviders(<OrganizerEvents />, { token: 'organizer-token' });

  expect(await screen.findByText('No events yet')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Create Event' })).toBeInTheDocument();
});

test('renders organizer events table when events exist', async () => {
  jest.mocked(getEvents).mockResolvedValue([{ ...mockEvent, status: 'PUBLISHED' }]);
  renderWithProviders(<OrganizerEvents />, { token: 'organizer-token' });

  expect(await screen.findByText('Indore Tech Summit')).toBeInTheDocument();
});

test('shows an error message when event loading fails', async () => {
  jest.mocked(getEvents).mockRejectedValue(new Error('Failed to load events'));
  renderWithProviders(<OrganizerEvents />, { token: 'organizer-token' });

  expect(await screen.findByText('Failed to load events')).toBeInTheDocument();
});
