import { screen } from '@testing-library/react';
import OrganizerDashboard from '@organizer/pages/Dashboard';
import { getCategoryReport, getDashboard, getMonthlyReport } from '@organizer/api/organizerApi';
import { renderWithProviders } from '@shared/test/test-utils';

jest.mock('@organizer/api/organizerApi', () => ({
  getDashboard: jest.fn(),
  getMonthlyReport: jest.fn(),
  getCategoryReport: jest.fn(),
}));

jest.mock('@organizer/components/DashboardCharts', () => ({
  MonthlyBarChart: () => <div>Monthly chart</div>,
  CategoryPieChart: () => <div>Category chart</div>,
}));

jest.mock('@shared/constants', () => ({
  ...jest.requireActual('@shared/constants'),
  formatCurrency: (value: string | number | null | undefined) => `₹${value ?? 0}`,
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getDashboard).mockResolvedValue({
    total_events: 3,
    active_events: 2,
    draft_events: 1,
    closed_events: 0,
    total_registrations: 12,
    total_revenue: 1500,
    upcoming_events: [],
  });
  jest.mocked(getMonthlyReport).mockResolvedValue([]);
  jest.mocked(getCategoryReport).mockResolvedValue([]);
});

test('renders organizer dashboard stats', async () => {
  renderWithProviders(<OrganizerDashboard />, { token: 'organizer-token' });

  expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  expect(screen.getByText('Total Events')).toBeInTheDocument();
  expect(screen.getByText('3')).toBeInTheDocument();
  expect(screen.getByText('Total Revenue')).toBeInTheDocument();
});
