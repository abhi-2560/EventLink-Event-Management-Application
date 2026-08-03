import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Loader from '../components/ui/Loader';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import { getEvent } from '../api/adminApi';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function EventDetail() {
  const { eventId } = useParams();
  const { data: e, isLoading, isError, error } = useQuery({
    queryKey: ['admin-event', eventId],
    queryFn: () => getEvent(eventId ?? ''),
  });

  if (isLoading) return <Loader />;
  if (isError) return <p className="text-danger">{error.message}</p>;
  if (!e) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/events" className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent"><ArrowLeft className="h-4 w-4" />Back</Link>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">{e.title}</h1>
        <StatusBadge status={e.status} />
        <StatusBadge status={e.registration_status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Info label="Organizer" value={e.organizer_name} />
        <Info label="Category" value={e.category_name} />
        <Info label="Type" value={e.event_type} />
        <Info label="Start" value={formatDate(e.start_datetime)} />
        <Info label="Location" value={[e.venue, e.city, e.state].filter(Boolean).join(', ') || 'Online'} />
        <Info label="Capacity" value={`${e.available_seats} / ${e.capacity}`} />
        <Info label="Price" value={e.is_free ? 'Free' : formatCurrency(e.ticket_price)} />
        <Info label="Revenue" value={formatCurrency(e.total_sales)} />
        <Info label="Registrations" value={e.total_registrations ?? 0} />
        <Info label="Tickets Sold" value={e.total_tickets_sold ?? 0} />
      </div>

      {e.description && (
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Description</h3>
          <p className="mt-2 text-sm text-slate-600">{e.description}</p>
        </div>
      )}

      <Link to={`/events/${eventId}/edit`}><Button>Edit Event</Button></Link>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
