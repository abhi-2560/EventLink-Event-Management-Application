import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SalesReport from './SalesReport';
import {
  getCategoryReport,
  getMonthlyReport,
  getPeriodReport,
  getSalesSummary,
} from '../../api/organizerApi';

jest.mock('../../api/organizerApi', () => ({
  getCategoryReport: jest.fn(),
  getMonthlyReport: jest.fn(),
  getPeriodReport: jest.fn(),
  getSalesSummary: jest.fn(),
}));

jest.mock('../../components/organizer/DashboardCharts', () => ({
  MonthlyBarChart: () => <div />,
  CategoryPieChart: () => <div />,
}));

function renderSalesReport() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter><SalesReport /></MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  getSalesSummary.mockResolvedValue({ recent_transactions: [] });
  getPeriodReport.mockResolvedValue({});
  getMonthlyReport.mockResolvedValue([]);
  getCategoryReport.mockResolvedValue([]);
});

test('refetches organizer reports with the selected end date', async () => {
  const { container } = renderSalesReport();
  const [, endDate] = container.querySelectorAll('input[type="date"]');
  const selectedEndDate = new Date('2025-05-31T23:59:59').toISOString();

  fireEvent.change(endDate, { target: { value: '2025-05-31' } });

  await waitFor(() => {
    expect(getPeriodReport).toHaveBeenLastCalledWith({
      start_date: expect.any(String),
      end_date: selectedEndDate,
    });
  });
  expect(getMonthlyReport).toHaveBeenLastCalledWith(expect.objectContaining({
    end_date: selectedEndDate,
  }));
  expect(getCategoryReport).toHaveBeenLastCalledWith(expect.objectContaining({
    end_date: selectedEndDate,
  }));
});
