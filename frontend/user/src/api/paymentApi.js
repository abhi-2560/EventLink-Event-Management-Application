import api from './axios';

export const validateCoupon = (payload) =>
  api.post('/coupons/validate', payload).then((r) => r.data);

export const createPaymentOrder = (registrationId) =>
  api.post('/payments/create-order', { registration_id: registrationId }).then((r) => r.data);

export const verifyPayment = (registrationId, orderId) =>
  api.post('/payments/verify', { registration_id: registrationId, order_id: orderId }).then((r) => r.data);

export const failPayment = (registrationId, failureReason) =>
  api.post('/payments/failure', { registration_id: registrationId, failure_reason: failureReason }).then((r) => r.data);

export const getReceipt = (paymentId) =>
  api.get(`/payments/${paymentId}/receipt`).then((r) => r.data);
