import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import Payment from '@registrant/pages/registration/Payment';
import { getRegistration } from '@registrant/api/registrationApi';
import { verifyPayment, failPayment } from '@registrant/api/paymentApi';
import { renderWithProviders } from '@shared/test/test-utils';
import { showError, showSuccess } from '@shared/utils/toast';
import type { Payment as PaymentRecord, Registration } from '@shared/types/api';

jest.mock('@registrant/api/registrationApi', () => ({
  getRegistration: jest.fn(),
}));

jest.mock('@registrant/api/paymentApi', () => ({
  verifyPayment: jest.fn(),
  failPayment: jest.fn(),
  createPaymentOrder: jest.fn(),
}));

jest.mock('@shared/utils/toast', () => ({
  showError: jest.fn(),
  showSuccess: jest.fn(),
}));

jest.mock('@shared/constants', () => ({
  formatCurrency: (value: string | number | null | undefined) => `₹${value ?? 0}`,
  formatDate: (value: string) => value,
}));

const registration: Registration = {
  id: 'reg-1',
  registrant_name: 'Test Registrant',
  registrant_phone: '9876543210',
  seats_booked: 1,
  registration_id: 'reg-1',
  event_id: 'evt-1',
  order_id: 'order-1',
  payment_id: 'payment-1',
  total_amount: '107.00',
  reservation_expires_at: '2030-12-31T10:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getRegistration).mockResolvedValue(registration);
});

test('completes a simulated successful payment', async () => {
  jest.mocked(verifyPayment).mockResolvedValue({
    id: 'payment-1',
    amount: '107.00',
    status: 'SUCCESS',
    payment_status: 'SUCCESS',
  } as PaymentRecord & { payment_status: string });

  renderWithProviders(
    <Routes>
      <Route path="/payment/:registrationId" element={<Payment />} />
      <Route path="/receipt/:paymentId" element={<p>Receipt page</p>} />
    </Routes>,
    { route: '/payment/reg-1' },
  );

  await screen.findByText('Complete Payment');
  await userEvent.click(screen.getByRole('button', { name: 'Simulate Success' }));

  await waitFor(() => {
    expect(screen.getByText('Registration Confirmed!')).toBeInTheDocument();
  });
  expect(verifyPayment).toHaveBeenCalledWith('reg-1', 'order-1');
  expect(showSuccess).toHaveBeenCalledWith('Payment successful');
});

test('handles simulated payment failure and returns to the event page', async () => {
  jest.mocked(failPayment).mockResolvedValue({ payment_status: 'FAILED' });

  renderWithProviders(
    <Routes>
      <Route path="/payment/:registrationId" element={<Payment />} />
      <Route path="/events/:eventId" element={<p>Event page</p>} />
    </Routes>,
    { route: '/payment/reg-1' },
  );

  await screen.findByText('Complete Payment');
  await userEvent.click(screen.getByRole('button', { name: 'Simulate Failure' }));

  await waitFor(() => {
    expect(screen.getByText('Event page')).toBeInTheDocument();
  });
  expect(failPayment).toHaveBeenCalledWith('reg-1', 'User simulated payment failure');
  expect(showError).toHaveBeenCalledWith('Payment failed. Your seat reservation has been released.');
});
