import { screen } from '@testing-library/react';
import Receipt from './Receipt';
import { renderWithProviders } from '../../test/test-utils';
import { getReceipt } from '../../api/paymentApi';

jest.mock('../../api/paymentApi', () => ({
  getReceipt: jest.fn(),
}));

jest.mock('../../utils/constants', () => ({
  formatCurrency: (value) => `₹${value}`,
  formatDate: (value) => value,
}));

const receipt = {
  payment_id: 'payment-1',
  receipt_number: 'RCPT-123',
  event_title: 'Receipt event',
  category_name: 'Conference',
  buyer_name: 'Test Buyer',
  buyer_phone: '9876543210',
  ticket_price: '100.00',
  discount: '0.00',
  convenience_fee: '0.00',
  gateway_fee: '0.00',
  amount: '100.00',
  payment_status: 'SUCCESS',
  completed_at: '2026-08-01T10:00:00Z',
};

function renderReceipt(overrides) {
  getReceipt.mockResolvedValue({ ...receipt, ...overrides });
  return renderWithProviders(<Receipt />);
}

test('renders only a safe join link for online events', async () => {
  renderReceipt({
    event_type: 'ONLINE',
    venue: 'Do not show',
    city: 'Indore',
    state: 'Madhya Pradesh',
    meeting_link: 'https://meet.example.test/room',
  });

  const joinLink = await screen.findByRole('link', { name: 'Join event' });
  expect(joinLink).toHaveAttribute('href', 'https://meet.example.test/room');
  expect(joinLink).toHaveAttribute('target', '_blank');
  expect(joinLink).toHaveAttribute('rel', 'noopener noreferrer');
  expect(screen.queryByText('Do not show, Indore, Madhya Pradesh')).not.toBeInTheDocument();
});

test('renders only venue and location for offline events', async () => {
  renderReceipt({
    event_type: 'OFFLINE',
    venue: 'Community Hall',
    city: 'Indore',
    state: 'Madhya Pradesh',
    meeting_link: 'https://meet.example.test/room',
  });

  expect(await screen.findByText('Community Hall, Indore, Madhya Pradesh')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Join event' })).not.toBeInTheDocument();
});

test('renders venue and join link for hybrid events', async () => {
  renderReceipt({
    event_type: 'HYBRID',
    venue: 'Community Hall',
    city: 'Indore',
    state: 'Madhya Pradesh',
    meeting_link: 'https://meet.example.test/room',
  });

  expect(await screen.findByText('Community Hall, Indore, Madhya Pradesh')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Join event' })).toHaveAttribute(
    'href',
    'https://meet.example.test/room',
  );
});
