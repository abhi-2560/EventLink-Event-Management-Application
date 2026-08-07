import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import EventDetails from '@registrant/pages/public/EventDetails';
import { getEvent } from '@registrant/api/eventApi';
import { mockEvent } from '@shared/test/fixtures';
import { renderWithProviders } from '@shared/test/test-utils';

jest.mock('@registrant/api/eventApi', () => ({
  getEvent: jest.fn(),
}));

jest.mock('@shared/constants', () => ({
  ...jest.requireActual('@shared/constants'),
  formatCurrency: (value: string | number | null | undefined) => `₹${value ?? 0}`,
  formatDate: (_value: string) => 'Jan 1, 2030',
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('shows loading state while event details load', () => {
  jest.mocked(getEvent).mockReturnValue(new Promise(() => {}));
  renderWithProviders(
    <Routes>
      <Route path="/events/:eventId" element={<EventDetails />} />
    </Routes>,
    { route: '/events/evt-1' },
  );

  expect(screen.getByText('Loading event...')).toBeInTheDocument();
});

test('renders event banner, gallery, and videos', async () => {
  jest.mocked(getEvent).mockResolvedValue(mockEvent);
  renderWithProviders(
    <Routes>
      <Route path="/events/:eventId" element={<EventDetails />} />
    </Routes>,
    { route: '/events/evt-1' },
  );

  expect(await screen.findByRole('img', { name: 'Indore Tech Summit banner' })).toBeInTheDocument();
  expect(screen.getByText('Gallery')).toBeInTheDocument();
  expect(screen.getByText('Videos')).toBeInTheDocument();
  expect(screen.getByText('10 of 50 seats left')).toBeInTheDocument();
});

test('shows an error state when the event cannot be loaded', async () => {
  jest.mocked(getEvent).mockRejectedValue(new Error('Event not found'));
  renderWithProviders(
    <Routes>
      <Route path="/events/:eventId" element={<EventDetails />} />
    </Routes>,
    { route: '/events/missing' },
  );

  expect(await screen.findByText('Event not found')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Back to events/i })).toHaveAttribute('href', '/');
});
