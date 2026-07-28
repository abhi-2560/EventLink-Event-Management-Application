import { formatCurrency } from '../../utils/constants';

export default function RegistrationSummary({ event, seats, couponPreview, totalAmount }) {
  const ticketPrice = Number(event?.ticket_price || 0);
  const convenienceFee = Number(event?.convenience_fee || 0);
  const gatewayFee = Number(event?.gateway_fee || 0);
  const subtotal = ticketPrice * seats + convenienceFee + gatewayFee;
  const discount = Number(couponPreview?.discount || 0);
  const total = totalAmount ?? Math.max(subtotal - discount, 0);

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Order summary</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <Row label={`Tickets (${seats} × ${event?.is_free ? 'Free' : formatCurrency(ticketPrice)})`} value={formatCurrency(ticketPrice * seats)} />
        {convenienceFee > 0 && <Row label="Convenience fee" value={formatCurrency(convenienceFee)} />}
        {gatewayFee > 0 && <Row label="Gateway fee" value={formatCurrency(gatewayFee)} />}
        {discount > 0 && <Row label="Coupon discount" value={`-${formatCurrency(discount)}`} className="text-success" />}
        <div className="border-t border-border pt-3">
          <Row label="Total" value={formatCurrency(total)} className="text-base font-semibold text-gray-900" />
        </div>
      </dl>
    </div>
  );
}

function Row({ label, value, className = '' }) {
  return (
    <div className={`flex justify-between ${className}`}>
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
