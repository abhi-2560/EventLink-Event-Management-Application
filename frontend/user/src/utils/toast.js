import toast from 'react-hot-toast';

export function showSuccess(message) {
  toast.success(message);
}

export function showError(error) {
  const message = error?.message || (typeof error === 'string' ? error : 'Something went wrong');
  toast.error(message);
}
