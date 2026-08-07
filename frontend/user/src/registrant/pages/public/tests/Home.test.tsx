import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@registrant/pages/public/Home';
import { getEvents, searchEvents } from '@registrant/api/eventApi';
import { mockEvent } from '@shared/test/fixtures';
import { renderWithProviders } from '@shared/test/test-utils';

jest.mock('@registrant/api/eventApi', () => ({
  getEvents: jest.fn(),
  searchEvents: jest.fn(),
}));

jest.mock('@registrant/components/event/SearchBar', () => ({
  __esModule: true,
  default: () => <div data-testid="search-bar" />,
  filtersToSearchParams: jest.requireActual('@registrant/components/event/SearchBar').filtersToSearchParams,
}));

jest.mock('@shared/constants', () => ({
  ...jest.requireActual('@shared/constants'),
  formatCurrency: (value: string | number | null | undefined) => `₹${value ?? 0}`,
  formatDate: (value: string) => value,
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('shows loading skeletons while events load', () => {
  jest.mocked(getEvents).mockReturnValue(new Promise(() => {}));
  renderWithProviders(<Home />);
  expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
});

test('renders browse events after loading', async () => {
  jest.mocked(getEvents).mockResolvedValue([mockEvent]);
  renderWithProviders(<Home />);

  expect(await screen.findByText('Browse All Events')).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getAllByText('Indore Tech Summit').length).toBeGreaterThan(0);
  });
});

test('shows an error message when event loading fails', async () => {
  jest.mocked(getEvents).mockRejectedValue(new Error('Failed to load events'));
  renderWithProviders(<Home />);

  expect(await screen.findByText('Failed to load events')).toBeInTheDocument();
});

test('searches events when URL filters are active', async () => {
  jest.mocked(searchEvents).mockResolvedValue([mockEvent]);
  renderWithProviders(<Home />, { route: '/?city=Indore' });

  expect(await screen.findByText('Search Results')).toBeInTheDocument();
  expect(searchEvents).toHaveBeenCalledWith({ city: 'Indore' });
  await waitFor(() => {
    expect(screen.getByText('1 event found')).toBeInTheDocument();
  });
});

test('clears filters from the search results view', async () => {
  jest.mocked(searchEvents).mockResolvedValue([mockEvent]);
  renderWithProviders(<Home />, { route: '/?city=Indore' });

  await screen.findByText('Clear all filters');
  await userEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));

  await waitFor(() => {
    expect(screen.getByText('Browse All Events')).toBeInTheDocument();
  });
});
