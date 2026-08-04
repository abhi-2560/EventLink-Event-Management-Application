import { screen } from '@testing-library/react';
import Dashboard from './Dashboard';
import { getCategoryReport, getDashboard, getMonthlyReport } from '../api/adminApi';
import { renderWithProviders } from '../test/test-utils';

jest.mock('../api/adminApi', () => ({
  getDashboard: jest.fn(),
  getMonthlyReport: jest.fn(),
  getCategoryReport: jest.fn(),
}));

jest.mock('../components/charts/ReportCharts', () => ({
  MonthlyBarChart: () => <div>Monthly chart</div>,
  CategoryPieChart: () => <div>Category chart</div>,
}));

jest.mock('../utils/helpers', () => ({
  ...jest.requireActual('../utils/helpers'),
  formatCurrency: (value: string | number | null | undefined) => `₹${value ?? 0}`,
  defaultDateRange: () => ({ start: '2025-01-01', end: '2025-06-30' }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getDashboard).mockResolvedValue({
    total_organizers: 4,
    total_events: 10,
    active_events: 6,
    total_registrations: 25,
    total_tickets_sold: 40,
    total_revenue: 5000,
  });
  jest.mocked(getMonthlyReport).mockResolvedValue([]);
  jest.mocked(getCategoryReport).mockResolvedValue([]);
});

test('renders admin dashboard stats', async () => {
  renderWithProviders(<Dashboard />, { token: 'admin-token' });

  expect(await screen.findByText('Platform overview')).toBeInTheDocument();
  expect(screen.getByText('Total Organizers')).toBeInTheDocument();
  expect(screen.getByText('Total Revenue')).toBeInTheDocument();
});

test('shows dashboard error state', async () => {
  jest.mocked(getDashboard).mockRejectedValue(new Error('Dashboard unavailable'));
  renderWithProviders(<Dashboard />, { token: 'admin-token' });

  expect(await screen.findByText('Dashboard unavailable')).toBeInTheDocument();
});
