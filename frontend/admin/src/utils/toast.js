import toast from 'react-hot-toast';
import { isServerUnavailable } from './apiError';

export function showSuccess(message) {
  toast.success(message);
}

export function showError(error) {
  const message = isServerUnavailable(error)
    ? 'Our servers are temporarily unavailable. Please try again shortly.'
    : error?.message || (typeof error === 'string' ? error : 'Something went wrong');
  toast.error(message);
}

export const showWarning = (message) => toast(message, { icon: '⚠️' });
export const showInfo = (message) => toast(message, { icon: 'ℹ️' });
export const showLoading = (message) => toast.loading(message);
export const dismissToast = (toastId) => toast.dismiss(toastId);
