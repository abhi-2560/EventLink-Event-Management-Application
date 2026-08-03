import Button from './Button';
import type { ComponentProps } from 'react';

type ConfirmDialogProps = {
  open: boolean; title: string; message: string; confirmLabel?: string;
  variant?: ComponentProps<typeof Button>['variant']; loading?: boolean;
  onConfirm: () => void; onCancel: () => void;
};
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', variant = 'danger', loading, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
