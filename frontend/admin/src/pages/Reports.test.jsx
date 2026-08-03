import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Reports from './Reports';
import { getCategoryReport, getMonthlyReport, getPeriodReport } from '../api/adminApi';

jest.mock('../api/adminApi', () => ({
  getCategoryReport: jest.fn(),
  getMonthlyReport: jest.fn(),
  getPeriodReport: jest.fn(),
}));

jest.mock('../components/charts/ReportCharts', () => ({
  MonthlyBarChart: () => <div />,
  CategoryPieChart: () => <div />,
}));

function renderReports() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter><Reports /></MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  getPeriodReport.mockResolvedValue({});
  getMonthlyReport.mockResolvedValue([]);
  getCategoryReport.mockResolvedValue([]);
});

test('refetches admin reports with the selected start date', async () => {
  const { container } = renderReports();
  const [startDate] = container.querySelectorAll('input[type="date"]');

  fireEvent.change(startDate, { target: { value: '2025-02-01' } });

  await waitFor(() => {
    expect(getPeriodReport).toHaveBeenLastCalledWith({
      start_date: '2025-02-01T00:00:00.000Z',
      end_date: expect.any(String),
    });
  });
  expect(getMonthlyReport).toHaveBeenLastCalledWith(expect.objectContaining({
    start_date: '2025-02-01T00:00:00.000Z',
  }));
  expect(getCategoryReport).toHaveBeenLastCalledWith(expect.objectContaining({
    start_date: '2025-02-01T00:00:00.000Z',
  }));
});
