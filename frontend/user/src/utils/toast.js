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

export function showWarning(message) {
  toast(message, { icon: '⚠️' });
}

export function showInfo(message) {
  toast(message, { icon: 'ℹ️' });
}

export function showLoading(message) {
  return toast.loading(message);
}

export function dismissToast(toastId) {
  toast.dismiss(toastId);
}
