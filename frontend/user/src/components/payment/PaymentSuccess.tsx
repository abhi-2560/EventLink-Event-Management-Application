import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/constants';
import type { Payment } from '../../types/api';

interface PaymentSuccessProps {
  payment: Payment & { payment_id?: string; receipt_number?: string };
}

export default function PaymentSuccess({ payment }: PaymentSuccessProps) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success text-white">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900">Registration Confirmed!</h2>
      <p className="mt-2 text-sm text-muted">
        Your payment of {formatCurrency(payment?.amount)} was successful.
      </p>
      {payment?.receipt_number && (
        <p className="mt-4 rounded-lg bg-white px-4 py-3 font-mono text-sm text-gray-700">
          Receipt: {payment.receipt_number}
        </p>
      )}
      <Link to={`/receipt/${payment?.payment_id}`} className="mt-6 inline-block">
        <Button size="lg">View Receipt</Button>
      </Link>
    </div>
  );
}
