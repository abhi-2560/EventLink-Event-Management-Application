import toast from 'react-hot-toast';
import { isServerUnavailable } from './apiError';

export function showSuccess(message: string) {
  toast.success(message);
}

export function showError(error: unknown) {
  const message = isServerUnavailable(error)
    ? 'Our servers are temporarily unavailable. Please try again shortly.'
    : (error instanceof Error ? error.message : typeof error === 'string' ? error : 'Something went wrong');
  toast.error(message);
}

export const showWarning = (message: string) => toast(message, { icon: '⚠️' });
export const showInfo = (message: string) => toast(message, { icon: 'ℹ️' });
export const showLoading = (message: string) => toast.loading(message);
export const dismissToast = (toastId?: string) => toast.dismiss(toastId);
