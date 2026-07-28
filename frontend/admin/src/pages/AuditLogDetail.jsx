import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Loader from '../components/ui/Loader';
import { getAuditLog } from '../api/adminApi';
import { formatDate } from '../utils/helpers';

export default function AuditLogDetail() {
  const { logId } = useParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-audit-log', logId],
    queryFn: () => getAuditLog(logId),
  });

  if (isLoading) return <Loader />;
  if (isError) return <p className="text-danger">{error.message}</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to="/audit-logs" className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent"><ArrowLeft className="h-4 w-4" />Back</Link>
      <h1 className="text-2xl font-bold">{data.action}</h1>
      <div className="space-y-3 rounded-xl border border-border bg-white p-6 shadow-sm text-sm">
        <Row label="Time" value={formatDate(data.created_at)} />
        <Row label="Actor" value={`${data.actor_name || '—'} (${data.actor_type})`} />
        <Row label="Entity" value={`${data.entity_name || '—'} (${data.entity_type})`} />
        {data.old_value && <Row label="Old Value" value={<pre className="mt-1 overflow-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(data.old_value, null, 2)}</pre>} />}
        {data.new_value && <Row label="New Value" value={<pre className="mt-1 overflow-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(data.new_value, null, 2)}</pre>} />}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted">{label}</p>
      <div className="mt-0.5">{typeof value === 'string' ? value : value}</div>
    </div>
  );
}
