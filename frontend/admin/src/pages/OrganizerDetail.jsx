import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Loader from '../components/ui/Loader';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { getOrganizer, updateOrganizer, archiveOrganizer } from '../api/adminApi';
import { organizerSchema } from '../schemas/adminSchemas';
import { formatCurrency, formatDate } from '../utils/helpers';
import { useState } from 'react';

export default function OrganizerDetail() {
  const { organizerId } = useParams();
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-organizer', organizerId],
    queryFn: () => getOrganizer(organizerId),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(organizerSchema),
    values: data ? {
      organizer_name: data.organizer_name,
      contact_person: data.contact_person,
      email: data.email,
      phone: data.phone,
    } : undefined,
  });

  const updateMut = useMutation({
    mutationFn: (payload) => updateOrganizer(organizerId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-organizer', organizerId] }),
  });

  const archiveMut = useMutation({
    mutationFn: () => archiveOrganizer(organizerId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-organizers'] }); setConfirm(false); },
  });

  if (isLoading) return <Loader />;
  if (isError) return <p className="text-danger">{error.message}</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/organizers" className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent"><ArrowLeft className="h-4 w-4" />Back</Link>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{data.organizer_name}</h1>
        <StatusBadge status={data.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Events" value={data.total_events ?? 0} />
        <Stat label="Registrations" value={data.total_registrations ?? 0} />
        <Stat label="Revenue" value={formatCurrency(data.total_sales)} />
      </div>

      <form onSubmit={handleSubmit((d) => updateMut.mutate(d))} className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Edit Organizer</h2>
        <Input label="Organization" {...register('organizer_name')} error={errors.organizer_name?.message} />
        <Input label="Contact Person" {...register('contact_person')} error={errors.contact_person?.message} />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
        {updateMut.isError && <p className="text-sm text-danger">{updateMut.error.message}</p>}
        <div className="flex gap-3">
          <Button type="submit" loading={updateMut.isPending}>Save</Button>
          {data.status === 'ACTIVE' && <Button type="button" variant="danger" onClick={() => setConfirm(true)}>Archive</Button>}
        </div>
      </form>

      <p className="text-xs text-muted">Created {formatDate(data.created_at)}</p>

      <ConfirmDialog open={confirm} title="Archive organizer?" message="This will deactivate the organizer account." loading={archiveMut.isPending}
        onConfirm={() => archiveMut.mutate()} onCancel={() => setConfirm(false)} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
