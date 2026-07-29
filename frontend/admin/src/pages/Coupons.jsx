import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Ticket, Plus } from 'lucide-react';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import Input, { Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import { createCoupon, deleteCoupon, getCoupons, updateCoupon } from '../api/adminApi';
import { couponSchema } from '../schemas/adminSchemas';
import { formatCurrency, paginate } from '../utils/helpers';
import { showError, showSuccess } from '../utils/toast';
import { useListSearchParams } from '../hooks/useListSearchParams';

const LIST_PARAMS = {
  q: { default: '' },
  page: { default: 1, type: 'number' },
};

function toPayload(data) {
  return {
    code: data.code.trim().toUpperCase(),
    description: data.description || undefined,
    flat_discount: data.flat_discount,
    expiry_date: data.expiry_date ? new Date(data.expiry_date).toISOString() : undefined,
    is_active: data.is_active ?? true,
  };
}

export default function Coupons() {
  const queryClient = useQueryClient();
  const { q: search, page, setParam } = useListSearchParams(LIST_PARAMS);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const pageSize = 10;

  const { data, isLoading, isError, error } = useQuery({ queryKey: ['admin-coupons'], queryFn: getCoupons });

  const form = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: { code: '', description: '', flat_discount: 0, expiry_date: '', is_active: true },
  });

  const saveMut = useMutation({
    mutationFn: (payload) => (modal?.mode === 'edit'
      ? updateCoupon(modal.coupon.coupon_id, payload)
      : createCoupon(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setModal(null);
      form.reset();
      showSuccess(modal?.mode === 'edit' ? 'Coupon updated' : 'Coupon created');
    },
    onError: showError,
  });

  const deleteMut = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setDeleteTarget(null);
      showSuccess('Coupon deactivated');
    },
    onError: showError,
  });

  const filtered = useMemo(() => (data || []).filter((c) => {
    const q = search.toLowerCase();
    return !q || c.code?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
  }), [data, search]);

  const { items, page: safePage, totalPages, total } = paginate(filtered, page, pageSize);

  const openCreate = () => {
    form.reset({ code: '', description: '', flat_discount: 0, expiry_date: '', is_active: true });
    setModal({ mode: 'create' });
  };

  const openEdit = (coupon) => {
    form.reset({
      code: coupon.code,
      description: coupon.description || '',
      flat_discount: Number(coupon.flat_discount),
      expiry_date: coupon.expiry_date?.slice(0, 16) || '',
      is_active: coupon.is_active ?? true,
    });
    setModal({ mode: 'edit', coupon });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Coupon Management</h1>
          <p className="text-sm text-muted">Create and manage platform-wide discount codes</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" />Add Coupon</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setParam('q', e.target.value, { resetKeys: ['page'] })}
          placeholder="Search by code or description..."
          className="w-full rounded-lg border border-border py-2 pl-10 pr-3 text-sm"
        />
      </div>

      {isLoading && <Loader />}
      {isError && <p className="text-sm text-danger">{error.message}</p>}
      {!isLoading && !filtered.length && (
        <EmptyState icon={Ticket} title="No coupons" description="Create a coupon to offer discounts on registrations." />
      )}

      {items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Uses</th>
                <th className="px-4 py-3">Total Given</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((c) => (
                <tr key={c.coupon_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{c.code}</td>
                  <td className="px-4 py-3">{formatCurrency(c.flat_discount)}</td>
                  <td className="px-4 py-3">{c.times_used ?? 0}</td>
                  <td className="px-4 py-3">{formatCurrency(c.total_discount_given)}</td>
                  <td className="px-4 py-3">{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.is_active ? 'ACTIVE' : 'INACTIVE'} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>Edit</Button>
                      {c.is_active && (
                        <Button variant="ghost" size="sm" className="text-danger" onClick={() => setDeleteTarget(c)}>Delete</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 pb-4"><PaginationFooter page={safePage} totalPages={totalPages} total={total} onPageChange={(p) => setParam('page', p)} /></div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={form.handleSubmit((d) => saveMut.mutate(toPayload(d)))}
            className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold">{modal.mode === 'edit' ? 'Edit Coupon' : 'New Coupon'}</h2>
            <Input label="Code" required {...form.register('code')} error={form.formState.errors.code?.message} />
            <Textarea label="Description" {...form.register('description')} />
            <Input label="Flat Discount (INR)" type="number" step="0.01" required {...form.register('flat_discount', { valueAsNumber: true })} error={form.formState.errors.flat_discount?.message} />
            <Input label="Expiry Date" type="datetime-local" {...form.register('expiry_date')} error={form.formState.errors.expiry_date?.message} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register('is_active')} />Active
            </label>
            <div className="flex gap-2 pt-2">
              <Button type="submit" loading={saveMut.isPending}>{modal.mode === 'edit' ? 'Save' : 'Create'}</Button>
              <Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Deactivate coupon?"
        message={`Deactivate "${deleteTarget?.code}"? It will no longer be usable.`}
        loading={deleteMut.isPending}
        onConfirm={() => deleteMut.mutate(deleteTarget.coupon_id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function PaginationFooter({ page, totalPages, total, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted">
      <span>{total} coupon{total === 1 ? '' : 's'}</span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button>
        <span>Page {page} of {totalPages}</span>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
