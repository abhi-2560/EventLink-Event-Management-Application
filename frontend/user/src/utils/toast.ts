import toast from 'react-hot-toast';
import { isServerUnavailable } from './apiError';

export function showSuccess(message: string) {
  toast.success(message);
}

export function showError(error: unknown) {
  const messageFromError = error instanceof Error ? error.message : undefined;
  const message = isServerUnavailable(error)
    ? 'Our servers are temporarily unavailable. Please try again shortly.'
    : messageFromError || (typeof error === 'string' ? error : 'Something went wrong');
  toast.error(message);
}

export function showWarning(message: string) {
  toast(message, { icon: '⚠️' });
}

export function showInfo(message: string) {
  toast(message, { icon: 'ℹ️' });
}

export function showLoading(message: string) {
  return toast.loading(message);
}

export function dismissToast(toastId: string) {
  toast.dismiss(toastId);
}
