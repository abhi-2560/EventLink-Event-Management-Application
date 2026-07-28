import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Users } from 'lucide-react';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/ui/Pagination';
import { getOrganizers } from '../api/adminApi';
import { formatCurrency, paginate } from '../utils/helpers';

export default function Organizers() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError, error } = useQuery({ queryKey: ['admin-organizers'], queryFn: getOrganizers });

  const filtered = (data || []).filter((o) => {
    const q = search.toLowerCase();
    const matchQ = !q || o.organizer_name?.toLowerCase().includes(q) || o.email?.toLowerCase().includes(q) || o.contact_person?.toLowerCase().includes(q);
    const matchS = !status || o.status === status;
    return matchQ && matchS;
  });

  const { items, page: safePage, totalPages, total } = paginate(filtered, page, pageSize);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Organizer Management</h1>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search organizers..." className="w-full rounded-lg border border-border py-2 pl-10 pr-3 text-sm" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-border px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {isLoading && <Loader />}
      {isError && <p className="text-sm text-danger">{error.message}</p>}
      {!isLoading && !filtered.length && <EmptyState icon={Users} title="No organizers" description="No organizers match your filters." />}

      {items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Events</th>
                <th className="px-4 py-3">Sales</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((o) => (
                <tr key={o.organizer_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{o.organizer_name}</td>
                  <td className="px-4 py-3"><p>{o.contact_person}</p><p className="text-xs text-muted">{o.email}</p></td>
                  <td className="px-4 py-3">{o.total_events ?? 0}</td>
                  <td className="px-4 py-3">{formatCurrency(o.total_sales)}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3"><Link to={`/organizers/${o.organizer_id}`} className="text-accent hover:underline">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 pb-4"><Pagination page={safePage} totalPages={totalPages} total={total} onPageChange={setPage} /></div>
        </div>
      )}
    </div>
  );
}
