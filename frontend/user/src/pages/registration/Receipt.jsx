import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Download, ArrowLeft, Ticket } from 'lucide-react';
import Container from '../../components/common/Container';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { getReceipt } from '../../api/paymentApi';
import { formatCurrency, formatDate } from '../../utils/constants';

export default function Receipt() {
  const { paymentId } = useParams();

  const { data: receipt, isLoading, isError, error } = useQuery({
    queryKey: ['receipt', paymentId],
    queryFn: () => getReceipt(paymentId),
  });

  if (isLoading) {
    return (
      <Container className="py-16">
        <Loader message="Loading receipt..." />
      </Container>
    );
  }

  if (isError || !receipt) {
    return (
      <Container className="py-16">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error?.message || 'Receipt not found'}</p>
        <Link to="/" className="mt-4 inline-block text-sm text-brand-600 hover:underline">Back to home</Link>
      </Container>
    );
  }

  const ticketSubtotal = Number(receipt.ticket_price || 0);
  const discount = Number(receipt.discount || 0);
  const convenienceFee = Number(receipt.convenience_fee || 0);
  const gatewayFee = Number(receipt.gateway_fee || 0);
  const location = formatLocation(receipt);
  const joinLink = safeJoinLink(receipt.meeting_link);

  return (
    <Container className="py-10">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>

      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-border bg-white shadow-lg">
        <div className="bg-gradient-to-r from-brand-700 to-brand-900 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-200">Payment Receipt</p>
              <h1 className="font-display text-3xl">{receipt.receipt_number}</h1>
            </div>
            <Ticket className="h-10 w-10 text-brand-200" />
          </div>
        </div>

        <div className="space-y-6 p-8">
          <Section title="Event">
            <p className="text-lg font-semibold text-gray-900">{receipt.event_title}</p>
            {receipt.category_name && (
              <p className="text-sm text-muted">{receipt.category_name}</p>
            )}
            {receipt.event_type === 'OFFLINE' && location && (
              <Detail label="Location" value={location} />
            )}
            {receipt.event_type === 'ONLINE' && joinLink && (
              <JoinLink href={joinLink} />
            )}
            {receipt.event_type === 'HYBRID' && (
              <>
                {location && <Detail label="Location" value={location} />}
                {joinLink && <JoinLink href={joinLink} />}
              </>
            )}
          </Section>

          <Section title="Buyer">
            <Detail label="Name" value={receipt.buyer_name} />
            <Detail label="Phone" value={receipt.buyer_phone} />
            {receipt.buyer_email && <Detail label="Email" value={receipt.buyer_email} />}
          </Section>

          <Section title="Price breakdown">
            <Detail label="Ticket price" value={formatCurrency(ticketSubtotal)} />
            {discount > 0 && <Detail label="Discount" value={`-${formatCurrency(discount)}`} />}
            {convenienceFee > 0 && <Detail label="Convenience fee" value={formatCurrency(convenienceFee)} />}
            {gatewayFee > 0 && <Detail label="Gateway fee" value={formatCurrency(gatewayFee)} />}
            <div className="mt-3 border-t border-border pt-3">
              <Detail label="Total paid" value={formatCurrency(receipt.amount)} bold />
            </div>
          </Section>

          <Section title="Payment info">
            <Detail label="Payment ID" value={receipt.payment_id} mono />
            <Detail label="Order ID" value={receipt.order_id} mono />
            <Detail label="Status" value={receipt.payment_status} />
            <Detail label="Completed" value={formatDate(receipt.completed_at)} />
          </Section>

          <Button variant="secondary" className="w-full" onClick={() => window.print()}>
            <Download className="h-4 w-4" />
            Print / Save Receipt
          </Button>
        </div>
      </div>
    </Container>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  );
}

function Detail({ label, value, mono, bold }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted">{label}</span>
      <span className={`text-right ${mono ? 'font-mono text-xs' : ''} ${bold ? 'text-lg font-bold text-gray-900' : 'font-medium text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}

function formatLocation({ venue, city, state }) {
  return [venue, city, state].filter(Boolean).join(', ');
}

function safeJoinLink(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function JoinLink({ href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block text-sm font-medium text-brand-600 hover:underline"
    >
      Join event
    </a>
  );
}
