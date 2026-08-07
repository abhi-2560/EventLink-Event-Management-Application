import { CreditCard, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@shared/constants';
import type { ReactNode } from 'react';

interface PaymentRegistration {
  event_title?: string;
  seats_booked?: number;
  order_id?: string;
  total_amount?: string | number;
  amount?: string | number;
}

export default function PaymentSummary({ registration }: { registration?: PaymentRegistration }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Payment details</h3>
      <div className="mt-4 space-y-2 text-sm">
        <Row label="Event" value={registration?.event_title} />
        <Row label="Seats" value={registration?.seats_booked} />
        <Row label="Order ID" value={registration?.order_id} mono />
        <Row label="Amount due" value={formatCurrency(registration?.total_amount || registration?.amount)} highlight />
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        Simulated payment — no real charges will be made
      </div>
    </div>
  );
}

function Row({ label, value, mono = false, highlight = false }: { label: ReactNode; value: ReactNode; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className={`text-right font-medium ${mono ? 'font-mono text-xs' : ''} ${highlight ? 'text-lg text-brand-700' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}

export function PaymentSimulationCard({ amount, onSuccess, onFailure, loading }: {
  amount: string | number;
  onSuccess: () => void;
  onFailure: () => void;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-brand-200 bg-gradient-to-b from-white to-brand-50/30 p-8">
      <div className="mx-auto max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg">
          <CreditCard className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Payment Simulation</h2>
        <p className="mt-2 text-sm text-muted">
          This is a demo payment gateway. Choose an outcome to simulate the transaction of{' '}
          <strong>{formatCurrency(amount)}</strong>.
        </p>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={onSuccess}
            disabled={loading}
            className="w-full rounded-xl bg-success px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            Simulate Success
          </button>
          <button
            type="button"
            onClick={onFailure}
            disabled={loading}
            className="w-full rounded-xl border border-danger bg-white px-6 py-3.5 text-sm font-semibold text-danger transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            Simulate Failure
          </button>
        </div>
      </div>
    </div>
  );
}
