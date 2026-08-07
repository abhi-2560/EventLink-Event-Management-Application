import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Events from './Events';
import { archiveEvent, getEvents } from '../api/adminApi';
import { mockEvent } from '../test/fixtures';
import { renderWithProviders } from '../test/test-utils';

jest.mock('../api/adminApi', () => ({
  getEvents: jest.fn(),
  archiveEvent: jest.fn(),
}));

jest.mock('../utils/helpers', () => ({
  ...jest.requireActual('../utils/helpers'),
  formatCurrency: (value: string | number | null | undefined) => `₹${value ?? 0}`,
  formatDateShort: (value: string) => value,
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getEvents).mockResolvedValue([
    mockEvent,
    { ...mockEvent, event_id: 'event-2', title: 'Draft Workshop', status: 'DRAFT' },
  ]);
});

test('renders events and filters by status', async () => {
  renderWithProviders(<Events />, { route: '/?status=DRAFT', token: 'admin-token' });

  expect(await screen.findByText('Draft Workshop')).toBeInTheDocument();
  expect(screen.queryByText('Indore Tech Summit')).not.toBeInTheDocument();
});

test('archives an event after confirmation', async () => {
  jest.mocked(getEvents).mockResolvedValue([mockEvent]);
  jest.mocked(archiveEvent).mockResolvedValue({ ...mockEvent, status: 'ARCHIVED' });

  renderWithProviders(<Events />, { token: 'admin-token' });
  await screen.findByText('Indore Tech Summit');

  await userEvent.click(screen.getByRole('button', { name: 'Archive' }));
  expect(screen.getByText('Archive event?')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

  await waitFor(() => {
    expect(jest.mocked(archiveEvent).mock.calls[0][0]).toBe('event-1');
  });
  await waitFor(() => {
    expect(getEvents).toHaveBeenCalledTimes(2);
  });
});

test('shows event loading errors', async () => {
  jest.mocked(getEvents).mockRejectedValue(new Error('Failed to load events'));
  renderWithProviders(<Events />, { token: 'admin-token' });

  expect(await screen.findByText('Failed to load events')).toBeInTheDocument();
});