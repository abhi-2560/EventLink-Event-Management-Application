import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ScrollText } from 'lucide-react';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import { getAuditLogs } from '../api/adminApi';
import { formatDate } from '../utils/helpers';
import { useListSearchParams } from '../hooks/useListSearchParams';

const LIST_PARAMS = {
  search: { default: '' },
  entity_type: { default: '' },
  actor_type: { default: '' },
  page: { default: 1, type: 'number' },
};

export default function AuditLogs() {
  const { search, entity_type: entityType, actor_type: actorType, page, setParam } = useListSearchParams(LIST_PARAMS);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-audit', search, entityType, actorType, page],
    queryFn: () => getAuditLogs({
      search: search || undefined,
      entity_type: entityType || undefined,
      actor_type: actorType || undefined,
      page,
      page_size: 20,
    }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      <p className="text-sm text-muted">All important business actions across the platform</p>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setParam('search', e.target.value, { resetKeys: ['page'] })} placeholder="Search action, entity, actor..." className="w-full rounded-lg border border-border py-2 pl-10 pr-3 text-sm" />
        </div>
        <select value={entityType} onChange={(e) => setParam('entity_type', e.target.value, { resetKeys: ['page'] })} className="rounded-lg border border-border px-3 py-2 text-sm">
          <option value="">All entities</option>
          <option value="event">Event</option>
          <option value="organizer">Organizer</option>
          <option value="registration">Registration</option>
          <option value="payment">Payment</option>
          <option value="coupon">Coupon</option>
          <option value="category">Category</option>
        </select>
        <select value={actorType} onChange={(e) => setParam('actor_type', e.target.value, { resetKeys: ['page'] })} className="rounded-lg border border-border px-3 py-2 text-sm">
          <option value="">All actors</option>
          <option value="ADMIN">Admin</option>
          <option value="ORGANIZER">Organizer</option>
          <option value="SYSTEM">System</option>
        </select>
      </div>

      {isLoading && <Loader />}
      {isError && <p className="text-sm text-danger">{error.message}</p>}

      {!isLoading && !data?.items?.length && (
        <EmptyState icon={ScrollText} title="No logs" description="No audit logs match your filters." />
      )}

      {data?.items?.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.map((log) => (
                <tr key={log.log_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap text-xs">{formatDate(log.created_at)}</td>
                  <td className="px-4 py-3 font-medium">{log.action}</td>
                  <td className="px-4 py-3"><p>{log.actor_name || '—'}</p><p className="text-xs text-muted">{log.actor_type}</p></td>
                  <td className="px-4 py-3"><p>{log.entity_name || '—'}</p><p className="text-xs text-muted">{log.entity_type}</p></td>
                  <td className="px-4 py-3"><Link to={`/audit-logs/${log.log_id}`} className="text-accent hover:underline">Details</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 pb-4">
            <Pagination page={data.page} totalPages={data.total_pages} total={data.total} onPageChange={(p) => setParam('page', p)} />
          </div>
        </div>
      )}
    </div>
  );
}
