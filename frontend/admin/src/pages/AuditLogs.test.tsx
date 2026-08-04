import { screen } from '@testing-library/react';
import AuditLogs from './AuditLogs';
import { getAuditLogs } from '../api/adminApi';
import { mockAuditLog } from '../test/fixtures';
import { renderWithProviders } from '../test/test-utils';

jest.mock('../api/adminApi', () => ({
  getAuditLogs: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getAuditLogs).mockResolvedValue({
    items: [mockAuditLog],
    page: 1,
    total_pages: 1,
    total: 1,
  });
});

test('renders audit logs', async () => {
  renderWithProviders(<AuditLogs />, { token: 'admin-token' });

  expect(await screen.findByText('Coupon Created')).toBeInTheDocument();
  expect(screen.getByText('SAVE10')).toBeInTheDocument();
});

test('shows audit log loading errors', async () => {
  jest.mocked(getAuditLogs).mockRejectedValue(new Error('Failed to load audit logs'));
  renderWithProviders(<AuditLogs />, { token: 'admin-token' });

  expect(await screen.findByText('Failed to load audit logs')).toBeInTheDocument();
});
