import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, XCircle } from 'lucide-react';
import Container from '../../components/common/Container';
import Loader from '../../components/common/Loader';
import PaymentSummary, { PaymentSimulationCard } from '../../components/payment/PaymentSummary';
import PaymentSuccess from '../../components/payment/PaymentSuccess';
import Button from '../../components/common/Button';
import { getRegistration } from '../../api/registrationApi';
import { verifyPayment, failPayment, createPaymentOrder } from '../../api/paymentApi';
import { useRegistration } from '../../context/RegistrationContext';
import { showError, showSuccess } from '../../utils/toast';
import type { Payment as PaymentRecord } from '../../types/api';
import type { RegistrationFlowState } from '../../context/RegistrationContext';
import { toApiError } from '../../utils/apiError';

export default function Payment() {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const { registration: contextReg, setRegistration } = useRegistration();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(PaymentRecord & { payment_status: string; payment_id?: string; receipt_number?: string }) | null>(null);
  const [failureMsg, setFailureMsg] = useState('');

  const { data: registration, isLoading } = useQuery<RegistrationFlowState>({
    queryKey: ['registration', registrationId],
    queryFn: () => getRegistration(registrationId ?? ''),
    initialData: contextReg && contextReg.registration_id === registrationId ? contextReg : undefined,
  });

  const orderId = contextReg?.order_id || registration?.order_id;
  const paymentId = contextReg?.payment_id || registration?.payment_id;
  const amount = registration?.total_amount || contextReg?.amount;

  const handleSuccess = async () => {
    setLoading(true);
    setFailureMsg('');
    try {
      let activeOrderId = orderId;
      if (!activeOrderId) {
        const order = await createPaymentOrder(registrationId ?? '');
        activeOrderId = order.order_id;
      }
      const payment = await verifyPayment(registrationId ?? '', activeOrderId);
      setResult(payment);
      setRegistration({ ...registration, ...payment });
      showSuccess('Payment successful');
    } catch (err) {
      showError(err);
      setFailureMsg(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const handleFailure = async () => {
    setLoading(true);
    setFailureMsg('');
    try {
      await failPayment(registrationId ?? '', 'User simulated payment failure');
      showError('Payment failed. Your seat reservation has been released.');
      navigate(`/events/${registration?.event_id}`, {
        state: { message: 'Payment failed. Your seat reservation has been released.' },
      });
    } catch (err) {
      setFailureMsg(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="py-16">
        <Loader message="Loading payment..." />
      </Container>
    );
  }

  if (result?.payment_status === 'SUCCESS') {
    return (
      <Container className="py-16">
        <PaymentSuccess payment={result} />
      </Container>
    );
  }

  const regData = { ...registration, order_id: orderId, payment_id: paymentId, amount };

  return (
    <Container className="py-10">
      <Link
        to={`/events/${registration?.event_id}/register`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to registration
      </Link>

      <h1 className="font-display text-3xl text-gray-900">Complete Payment</h1>
      <p className="mt-2 text-sm text-muted">
        Reservation expires at {registration?.reservation_expires_at
          ? new Date(registration.reservation_expires_at).toLocaleString()
          : '—'}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <PaymentSummary registration={regData} />
        <PaymentSimulationCard
          amount={amount ?? 0}
          onSuccess={handleSuccess}
          onFailure={handleFailure}
          loading={loading}
        />
      </div>

      {failureMsg && (
        <div className="mt-6 flex items-start gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {failureMsg}
        </div>
      )}
    </Container>
  );
}
