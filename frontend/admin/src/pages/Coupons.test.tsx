import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Coupons from './Coupons';
import { createCoupon, getCoupons } from '../api/adminApi';
import { mockCoupon } from '../test/fixtures';
import { renderWithProviders } from '../test/test-utils';
import { showSuccess } from '../utils/toast';

jest.mock('../api/adminApi', () => ({
  getCoupons: jest.fn(),
  createCoupon: jest.fn(),
  updateCoupon: jest.fn(),
  deleteCoupon: jest.fn(),
}));

jest.mock('../utils/toast', () => ({
  showError: jest.fn(),
  showSuccess: jest.fn(),
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
  jest.mocked(getCoupons).mockResolvedValue([mockCoupon]);
});

test('filters coupons by search query', async () => {
  jest.mocked(getCoupons).mockResolvedValue([
    mockCoupon,
    { ...mockCoupon, coupon_id: 'coupon-2', code: 'WELCOME20' },
  ]);

  renderWithProviders(<Coupons />, { route: '/?q=save', token: 'admin-token' });

  expect(await screen.findByText('SAVE10')).toBeInTheDocument();
  expect(screen.queryByText('WELCOME20')).not.toBeInTheDocument();
});

test('creates a coupon from the modal form', async () => {
  jest.mocked(createCoupon).mockResolvedValue({ ...mockCoupon, code: 'NEW15' });

  renderWithProviders(<Coupons />, { token: 'admin-token' });
  await screen.findByText('SAVE10');
  await userEvent.click(screen.getByRole('button', { name: /Add Coupon/i }));

  await userEvent.type(screen.getByLabelText(/^Code/i), 'NEW15');
  await userEvent.clear(screen.getByLabelText(/^Flat Discount/i));
  await userEvent.type(screen.getByLabelText(/^Flat Discount/i), '15');
  await userEvent.click(screen.getByRole('button', { name: 'Create' }));

  await waitFor(() => {
    expect(jest.mocked(createCoupon).mock.calls[0][0]).toEqual(
      expect.objectContaining({ code: 'NEW15', flat_discount: 15 }),
    );
  });
  expect(showSuccess).toHaveBeenCalledWith('Coupon created');
});
