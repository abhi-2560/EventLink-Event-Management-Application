import api from './axios';
import type { CouponValidation, Payment, PaymentReceipt } from '../types/api';

export const validateCoupon = (payload: Record<string, unknown>) =>
  api.post<CouponValidation>('/coupons/validate', payload).then((r) => r.data);

export const createPaymentOrder = (registrationId: string) =>
  api.post<{ order_id: string }>('/payments/create-order', { registration_id: registrationId }).then((r) => r.data);

export const verifyPayment = (registrationId: string, orderId: string) =>
  api.post<Payment & { payment_status: string }>('/payments/verify', { registration_id: registrationId, order_id: orderId }).then((r) => r.data);

export const failPayment = (registrationId: string, failureReason: string) =>
  api.post('/payments/failure', { registration_id: registrationId, failure_reason: failureReason }).then((r) => r.data);

export const getReceipt = (paymentId: string) =>
  api.get<PaymentReceipt>(`/payments/${paymentId}/receipt`).then((r) => r.data);
