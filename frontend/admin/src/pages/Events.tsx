import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, CalendarDays } from 'lucide-react';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/ui/Pagination';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { getEvents, archiveEvent } from '../api/adminApi';
import { formatCurrency, formatDateShort, paginate } from '../utils/helpers';
import { useListSearchParams } from '../hooks/useListSearchParams';

import useDebounce from '../hooks/useDebounce';
import type { Event, Id } from '../types/admin';

const LIST_PARAMS = {
  q: { default: '' },
  status: { default: '' },
  page: { default: 1, type: 'number' },
};

export default function Events() {
  const { q: search, status, page, setParam } = useListSearchParams(LIST_PARAMS);
  const debouncedSearch = useDebounce(search, 500);
  const [confirm, setConfirm] = useState<Event | null>(null);
  const queryClient = useQueryClient();
  const pageSize = 10;

  const { data, isLoading, isError, error } = useQuery({ queryKey: ['admin-events'], queryFn: getEvents });

  const archiveMut = useMutation({
    mutationFn: (id: Id) => archiveEvent(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-events'] }); setConfirm(null); },
  });

  // const filtered = (data || []).filter((e) => {
  //   const q = search.toLowerCase();
  //   const matchQ = !q || e.title?.toLowerCase().includes(q) || e.organizer_name?.toLowerCase().includes(q) || e.city?.toLowerCase().includes(q);
  //   const matchS = !status || e.status === status;
  //   return matchQ && matchS;
  // });

  const filtered = ((data || []) as Event[]).filter((e) => {
    const q = debouncedSearch.toLowerCase();

    const matchQ =
      !q ||
      e.title?.toLowerCase().includes(q) ||
      e.organizer_name?.toLowerCase().includes(q) ||
      e.city?.toLowerCase().includes(q);

    const matchS = !status || e.status === status;

    return matchQ && matchS;
  });

  const { items, page: safePage, totalPages, total } = paginate(filtered, page, pageSize);



  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Event Management</h1>
      <p className="text-sm text-muted">View and manage all platform events. Admins cannot create events.</p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setParam('q', e.target.value, { resetKeys: ['page'] })} placeholder="Search events..." className="w-full rounded-lg border border-border py-2 pl-10 pr-3 text-sm" />
        </div>
        <select value={status} onChange={(e) => setParam('status', e.target.value, { resetKeys: ['page'] })} className="rounded-lg border border-border px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {isLoading && <Loader />}
      {isError && <p className="text-sm text-danger">{error.message}</p>}
      {!isLoading && !filtered.length && <EmptyState icon={CalendarDays} title="No events" description="No events match filters." />}

      {items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Organizer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Seats</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((e) => (
                <tr key={e.event_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3"><Link to={`/events/${e.event_id}`} className="font-medium text-accent hover:underline">{e.title}</Link><p className="text-xs text-muted">{e.category_name}</p></td>
                  <td className="px-4 py-3">{e.organizer_name}</td>
                  <td className="px-4 py-3">{formatDateShort(e.start_datetime)}</td>
                  <td className="px-4 py-3">{e.available_seats}/{e.capacity}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/events/${e.event_id}/edit`}><Button variant="ghost" size="sm">Edit</Button></Link>
                      {e.status !== 'ARCHIVED' && <Button variant="ghost" size="sm" className="text-danger" onClick={() => setConfirm(e)}>Archive</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 pb-4"><Pagination page={safePage} totalPages={totalPages} total={total} onPageChange={(p) => setParam('page', p)} /></div>
        </div>
      )}

      <ConfirmDialog open={Boolean(confirm)} title="Archive event?" message={`Archive "${confirm?.title}"?`} loading={archiveMut.isPending}
        onConfirm={() => { if (confirm) archiveMut.mutate(confirm.event_id); }} onCancel={() => setConfirm(null)} />
    </div>
  );
}
