import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import Register from '@registrant/pages/registration/Register';
import { getEvent } from '@registrant/api/eventApi';
import { createRegistration } from '@registrant/api/registrationApi';
import { validateCoupon } from '@registrant/api/paymentApi';
import { mockEvent } from '@shared/test/fixtures';
import { renderWithProviders } from '@shared/test/test-utils';
import { showSuccess } from '@shared/utils/toast';
import type { Registration } from '@shared/types/api';

jest.mock('@registrant/api/eventApi', () => ({
  getEvent: jest.fn(),
}));

jest.mock('@registrant/api/registrationApi', () => ({
  createRegistration: jest.fn(),
}));

jest.mock('@registrant/api/paymentApi', () => ({
  validateCoupon: jest.fn(),
}));

jest.mock('@shared/utils/toast', () => ({
  showError: jest.fn(),
  showSuccess: jest.fn(),
}));

jest.mock('@shared/constants', () => ({
  ...jest.requireActual('@shared/constants'),
  formatCurrency: (value: string | number | null | undefined) => `₹${value ?? 0}`,
  formatDate: (value: string) => value,
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getEvent).mockResolvedValue(mockEvent);
});

test('shows validation errors for an incomplete registration form', async () => {
  renderWithProviders(
    <Routes>
      <Route path="/events/:eventId/register" element={<Register />} />
    </Routes>,
    { route: '/events/evt-1/register' },
  );

  await screen.findByText(/Register for Indore Tech Summit/i);
  await userEvent.click(screen.getByRole('button', { name: 'Proceed to Payment' }));

  expect(await screen.findByText('Name must be at least 2 characters')).toBeInTheDocument();
  expect(screen.getByText('Enter a valid phone number')).toBeInTheDocument();
  expect(createRegistration).not.toHaveBeenCalled();
});

test('creates a registration and navigates to payment', async () => {
  jest.mocked(createRegistration).mockResolvedValue({
    id: 'reg-1',
    registrant_name: 'Test Registrant',
    registrant_phone: '9876543210',
    seats_booked: 1,
    registration_id: 'reg-1',
    order_id: 'order-1',
    payment_id: 'payment-1',
    total_amount: '107.00',
    event_id: 'evt-1',
  } satisfies Registration);

  renderWithProviders(
    <Routes>
      <Route path="/events/:eventId/register" element={<Register />} />
      <Route path="/payment/:registrationId" element={<p>Payment page</p>} />
    </Routes>,
    { route: '/events/evt-1/register' },
  );

  await screen.findByText(/Register for Indore Tech Summit/i);
  await userEvent.type(screen.getByPlaceholderText('Your name'), 'Test Registrant');
  await userEvent.type(screen.getByPlaceholderText('10-digit mobile number'), '9876543210');
  await userEvent.click(screen.getByRole('button', { name: 'Proceed to Payment' }));

  await waitFor(() => {
    expect(screen.getByText('Payment page')).toBeInTheDocument();
  });
  expect(jest.mocked(createRegistration).mock.calls[0][0]).toEqual(expect.objectContaining({
    event_id: 'evt-1',
    registrant_name: 'Test Registrant',
    registrant_phone: '9876543210',
    seats_booked: 1,
  }));
  expect(showSuccess).toHaveBeenCalledWith('Registration created. Proceed to payment.');
});

test('applies a coupon preview before checkout', async () => {
  jest.mocked(validateCoupon).mockResolvedValue({ discount: '10.00', final_amount: '97.00' });

  renderWithProviders(
    <Routes>
      <Route path="/events/:eventId/register" element={<Register />} />
    </Routes>,
    { route: '/events/evt-1/register' },
  );

  await screen.findByText(/Register for Indore Tech Summit/i);
  await userEvent.type(screen.getByPlaceholderText('Enter coupon code'), 'SAVE10');
  await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

  expect(await screen.findByText(/Coupon applied: -10.00 off/i)).toBeInTheDocument();
  expect(validateCoupon).toHaveBeenCalledWith({
    coupon_code: 'SAVE10',
    event_id: 'evt-1',
    seat_count: 1,
  });
});

test('shows coupon validation errors', async () => {
  jest.mocked(validateCoupon).mockRejectedValue({ response: { data: { error: 'Coupon is invalid' } }, isAxiosError: true });

  renderWithProviders(
    <Routes>
      <Route path="/events/:eventId/register" element={<Register />} />
    </Routes>,
    { route: '/events/evt-1/register' },
  );

  await screen.findByText(/Register for Indore Tech Summit/i);
  await userEvent.type(screen.getByPlaceholderText('Enter coupon code'), 'BAD');
  await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

  expect(await screen.findByText(/Coupon is invalid|Something went wrong/i)).toBeInTheDocument();
});
