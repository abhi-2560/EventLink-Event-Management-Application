import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Edit, Users, Lock, Archive } from 'lucide-react';
import Button from '@shared/components/common/Button';
import StatusBadge from '@organizer/components/StatusBadge';
import Pagination, { paginate } from '@organizer/components/Pagination';
import ConfirmDialog from '@organizer/components/ConfirmDialog';
import { formatCurrency, formatDateShort } from '@shared/constants';
import { closeRegistration, archiveEvent } from '@organizer/api/organizerApi';
import { showError, showSuccess } from '@shared/utils/toast';
import { useListSearchParams } from '@shared/hooks/useListSearchParams';
import type { ChangeEvent } from 'react';
import type { Event } from '@shared/types/api';

const LIST_PARAMS = {
  q: { default: '' },
  status: { default: '' },
  page: { default: 1, type: 'number' as const },
} as const;

type EventAction = 'close' | 'archive';
interface Confirmation {
  action: EventAction;
  event: Event;
}
interface EventTableProps {
  events: Event[];
  loading: boolean;
}

export default function EventTable({ events, loading }: EventTableProps) {
  const { q: search, status: statusFilter, page, setParam } = useListSearchParams(LIST_PARAMS);
  const [confirm, setConfirm] = useState<Confirmation | null>(null);
  const queryClient = useQueryClient();
  const pageSize = 8;

  const mutation = useMutation<unknown, Error, { action: EventAction; eventId: string }>({
    mutationFn: ({ action, eventId }) => {
      if (action === 'close') return closeRegistration(eventId);
      if (action === 'archive') return archiveEvent(eventId);
      return Promise.reject(new Error('Unknown action'));
    },
    onSuccess: (_data, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      setConfirm(null);
      showSuccess(action === 'close' ? 'Registration closed' : 'Event archived');
    },
    onError: showError,
  });

  const filtered = events.filter((e: Event) => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.title.toLowerCase().includes(q) || e.city?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || e.status === statusFilter || (statusFilter === 'CLOSED' && e.registration_status === 'CLOSED');
    return matchSearch && matchStatus;
  });

  const { items, page: safePage, totalPages, total } = paginate(filtered, page, pageSize);

  if (loading) return null;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setParam('q', e.target.value, { resetKeys: ['page'] }); }}
            placeholder="Search events..."
            className="w-full rounded-lg border border-border py-2.5 pl-10 pr-4 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => { setParam('status', e.target.value, { resetKeys: ['page'] }); }}
          className="rounded-lg border border-border px-3 py-2.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CLOSED">Closed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <Link to="/organizer/events/new">
          <Button >Create Event</Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Seats</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((event) => (
                <tr key={event.event_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/organizer/events/${event.event_id}`} className="font-medium text-brand-700 hover:underline">
                      {event.title}
                    </Link>
                    <p className="text-xs text-muted">{event.city || event.event_type}</p>
                  </td>
                  <td className="px-4 py-3">{formatDateShort(event.start_datetime)}</td>
                  <td className="px-4 py-3">{event.available_seats}/{event.capacity}</td>
                  <td className="px-4 py-3">{event.is_free ? 'Free' : formatCurrency(event.ticket_price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <StatusBadge status={event.status} />
                      <StatusBadge status={event.registration_status} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Link to={`/organizer/events/${event.event_id}/edit`}>
                        <Button variant="ghost" size="sm"><Edit className="h-3.5 w-3.5" /></Button>
                      </Link>
                      <Link to={`/organizer/events/${event.event_id}/registrations`}>
                        <Button variant="ghost" size="sm"><Users className="h-3.5 w-3.5" /></Button>
                      </Link>
                      {event.registration_status === 'OPEN' && event.status === 'PUBLISHED' && (
                        <Button variant="ghost" size="sm" onClick={() => setConfirm({ action: 'close', event })}>
                          <Lock className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {event.status !== 'ARCHIVED' && (
                        <Button variant="ghost" size="sm" className="text-danger" onClick={() => setConfirm({ action: 'archive', event })}>
                          <Archive className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted">No events found.</p>
        )}
        <div className="px-4 pb-4">
          <Pagination page={safePage} totalPages={totalPages} onPageChange={(p) => setParam('page', p)} />
          <p className="text-xs text-muted">{total} event(s) total</p>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.action === 'close' ? 'Close registration?' : 'Archive event?'}
        message={confirm?.action === 'close'
          ? `Close registration for "${confirm?.event?.title}"?`
          : `Archive "${confirm?.event?.title}"? This cannot be undone easily.`}
        confirmLabel={confirm?.action === 'close' ? 'Close Registration' : 'Archive'}
        loading={mutation.isPending}
        onConfirm={() => confirm && mutation.mutate({ action: confirm.action, eventId: confirm.event.event_id })}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
