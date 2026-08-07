import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SalesReport from '@organizer/pages/SalesReport';
import {
  getCategoryReport,
  getMonthlyReport,
  getPeriodReport,
  getSalesSummary,
} from '@organizer/api/organizerApi';
import type { CategoryReportItem, PeriodReport, SalesSummary } from '@organizer/api/organizerApi';

jest.mock('@organizer/api/organizerApi', () => ({
  getCategoryReport: jest.fn(),
  getMonthlyReport: jest.fn(),
  getPeriodReport: jest.fn(),
  getSalesSummary: jest.fn(),
}));
jest.mock('@shared/constants', () => ({
  formatCurrency: (value: string | number | null | undefined) => `₹${value ?? 0}`,
  formatDate: (value: string) => value,
}));

jest.mock('@organizer/components/DashboardCharts', () => ({
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
  jest.mocked(getSalesSummary).mockResolvedValue({ recent_transactions: [] } satisfies SalesSummary);
  jest.mocked(getPeriodReport).mockResolvedValue({ total_events: 0, total_revenue: 0, total_registrations: 0 } satisfies PeriodReport);
  jest.mocked(getMonthlyReport).mockResolvedValue([]);
  jest.mocked(getCategoryReport).mockResolvedValue([] satisfies CategoryReportItem[]);
});

test('refetches organizer reports with the selected end date', async () => {
  const { container } = renderSalesReport();
  const dateInputs = await waitFor(() => {
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="date"]');
    if (inputs.length !== 2) throw new Error('Date inputs are not rendered');
    return inputs;
  });
  const [, endDate] = dateInputs;
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
