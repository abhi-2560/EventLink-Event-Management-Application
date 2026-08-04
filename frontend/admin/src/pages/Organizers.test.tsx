import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Organizers from './Organizers';
import { getOrganizers } from '../api/adminApi';
import { mockOrganizer } from '../test/fixtures';
import { renderWithProviders } from '../test/test-utils';

jest.mock('../api/adminApi', () => ({
  getOrganizers: jest.fn(),
}));

jest.mock('../utils/helpers', () => ({
  ...jest.requireActual('../utils/helpers'),
  formatCurrency: (value: string | number | null | undefined) => `₹${value ?? 0}`,
  paginate: (items: unknown[], page: number, pageSize: number) => {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      page: safePage,
      totalPages,
      total: items.length,
    };
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getOrganizers).mockResolvedValue([mockOrganizer]);
});

test('renders organizers and filters by search query', async () => {
  renderWithProviders(<Organizers />, { token: 'admin-token' });

  expect(await screen.findByText('Test Organizer')).toBeInTheDocument();
  await userEvent.type(screen.getByPlaceholderText('Search organizers...'), 'missing');

  expect(screen.getByText('No organizers match your filters.')).toBeInTheDocument();
});

test('filters organizers by status', async () => {
  jest.mocked(getOrganizers).mockResolvedValue([
    mockOrganizer,
    { ...mockOrganizer, organizer_id: 'org-2', organizer_name: 'Inactive Org', status: 'INACTIVE' },
  ]);

  renderWithProviders(<Organizers />, { route: '/?status=INACTIVE', token: 'admin-token' });

  expect(await screen.findByText('Inactive Org')).toBeInTheDocument();
  expect(screen.queryByText('Test Organizer')).not.toBeInTheDocument();
});
