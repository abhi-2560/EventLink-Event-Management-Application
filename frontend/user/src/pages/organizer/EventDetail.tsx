import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Users, Lock, Archive, Globe } from 'lucide-react';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/organizer/StatusBadge';
import ConfirmDialog from '../../components/organizer/ConfirmDialog';
import { formatCurrency, formatDate } from '../../utils/constants';
import { getEvent, publishEvent, closeRegistration, archiveEvent } from '../../api/organizerApi';
import { showError, showSuccess } from '../../utils/toast';
import { useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { toApiError } from '../../utils/apiError';

type EventAction = 'publish' | 'close' | 'archive';
interface Confirmation {
  action: EventAction;
}
export default function OrganizerEventDetail() {
  const { eventId } = useParams();
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState<Confirmation | null>(null);

  const { data: event, isLoading, isError, error } = useQuery({
    queryKey: ['organizer-event', eventId],
    queryFn: () => getEvent(eventId ?? ''),
  });

  const mutation = useMutation<unknown, Error, EventAction>({
    mutationFn: (action) => {
      if (action === 'publish') return publishEvent(eventId ?? '');
      if (action === 'close') return closeRegistration(eventId ?? '');
      if (action === 'archive') return archiveEvent(eventId ?? '');
      return Promise.reject(new Error('Unknown action'));
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ['organizer-event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      setConfirm(null);
      if (action === 'publish') showSuccess('Event published');
      if (action === 'close') showSuccess('Registration closed');
      if (action === 'archive') showSuccess('Event archived');
    },
    onError: showError,
  });

  if (isLoading) return <Loader message="Loading event..." />;
  if (isError) return <p className="text-sm text-danger">{toApiError(error).message}</p>;
  if (!event) return <p className="text-sm text-danger">Event not found.</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={event.status} />
            <StatusBadge status={event.registration_status} />
          </div>
          <h1 className="mt-3 font-display text-3xl text-gray-900">{event.title}</h1>
          <p className="mt-2 text-muted">{event.category_name} · {event.event_type}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/organizer/events/${eventId}/edit`}><Button variant="secondary"><Edit className="h-4 w-4" /> Edit</Button></Link>
          <Link to={`/organizer/events/${eventId}/registrations`}><Button variant="secondary"><Users className="h-4 w-4" /> Registrations</Button></Link>
          {(event.status === 'DRAFT' || event.status === 'ARCHIVED') && (
            <Button variant="success" onClick={() => setConfirm({ action: 'publish' })}>Publish</Button>
          )}
          {event.registration_status === 'OPEN' && event.status === 'PUBLISHED' && (
            <Button variant="secondary" onClick={() => setConfirm({ action: 'close' })}><Lock className="h-4 w-4" /> Close Registration</Button>
          )}
          {event.status !== 'ARCHIVED' && (
            <Button variant="danger" onClick={() => setConfirm({ action: 'archive' })}><Archive className="h-4 w-4" /> Archive</Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard label="Start" value={formatDate(event.start_datetime)} />
        <InfoCard label="Location" value={[event.venue, event.city, event.state].filter(Boolean).join(', ') || 'Online'} icon={Globe} />
        <InfoCard label="Capacity" value={`${event.available_seats} / ${event.capacity} available`} />
        <InfoCard label="Price" value={event.is_free ? 'Free' : formatCurrency(event.ticket_price)} />
        <InfoCard label="Registrations" value={event.total_registrations ?? 0} />
        <InfoCard label="Revenue" value={formatCurrency(event.total_sales)} />
      </div>

      {event.description && (
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900">Description</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{event.description}</p>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.action === 'publish' ? 'Publish event?' : confirm?.action === 'close' ? 'Close registration?' : 'Archive event?'}
        message="This action will update the event status."
        confirmLabel={confirm?.action === 'publish' ? 'Publish' : confirm?.action === 'close' ? 'Close Registration' : 'Archive'}
        variant={confirm?.action === 'publish' ? 'success' : 'danger'}
        loading={mutation.isPending}
        onConfirm={() => confirm && mutation.mutate(confirm.action)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

function InfoCard({ label, value, icon: Icon }: { label: string; value: ReactNode; icon?: ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 flex items-center gap-2 font-medium text-gray-900">
        {Icon && <Icon className="h-4 w-4 text-brand-600" />}
        {value}
      </p>
    </div>
  );
}
