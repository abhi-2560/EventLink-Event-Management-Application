import { screen } from '@testing-library/react';
import OrganizerEvents from './Events';
import { getEvents } from '../../api/organizerApi';
import { mockEvent } from '../../test/fixtures';
import { renderWithProviders } from '../../test/test-utils';

jest.mock('../../api/organizerApi', () => ({
  getEvents: jest.fn(),
}));

jest.mock('./CreateEvent', () => () => null);

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
