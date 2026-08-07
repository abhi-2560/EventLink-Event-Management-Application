import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlatformFeeSettings from './PlatformFeeSettings';
import { getPlatformFees, updatePlatformFees } from '../api/adminApi';
import { renderWithProviders } from '../test/test-utils';
import { showSuccess } from '../utils/toast';

jest.mock('../api/adminApi', () => ({
  getPlatformFees: jest.fn(),
  updatePlatformFees: jest.fn(),
}));

jest.mock('../utils/toast', () => ({
  showError: jest.fn(),
  showSuccess: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getPlatformFees).mockResolvedValue({
    convenience_fee: '5.00',
    gateway_fee: '2.00',
    updated_at: '2026-08-01T10:00:00Z',
  });
});

test('loads platform fee settings into the form', async () => {
  renderWithProviders(<PlatformFeeSettings />, { token: 'admin-token' });

  expect(await screen.findByDisplayValue('5')).toBeInTheDocument();
  expect(screen.getByDisplayValue('2')).toBeInTheDocument();
});

test('updates platform fee settings', async () => {
  jest.mocked(updatePlatformFees).mockResolvedValue({
    convenience_fee: '6.00',
    gateway_fee: '3.00',
    updated_at: '2026-08-02T10:00:00Z',
  });

  renderWithProviders(<PlatformFeeSettings />, { token: 'admin-token' });
  await screen.findByDisplayValue('5');

  await userEvent.clear(screen.getByLabelText(/^Convenience Fee/i));
  await userEvent.type(screen.getByLabelText(/^Convenience Fee/i), '6');
  await userEvent.clear(screen.getByLabelText(/^Gateway Fee/i));
  await userEvent.type(screen.getByLabelText(/^Gateway Fee/i), '3');
  await userEvent.click(screen.getByRole('button', { name: 'Save Settings' }));

  await waitFor(() => {
    expect(jest.mocked(updatePlatformFees).mock.calls[0][0]).toEqual({
      convenience_fee: 6,
      gateway_fee: 3,
    });
  });
  expect(showSuccess).toHaveBeenCalledWith('Platform fees updated');
  await waitFor(() => {
    expect(getPlatformFees).toHaveBeenCalledTimes(2);
  });
});