import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Receipt } from 'lucide-react';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/organizer/StatusBadge';
import { getEvent, getRegistrations } from '../../api/organizerApi';
import { formatCurrency } from '../../utils/constants';
import { Users } from 'lucide-react';

export default function OrganizerRegistrations() {
  const { eventId } = useParams();

  const eventQuery = useQuery({ queryKey: ['organizer-event', eventId], queryFn: () => getEvent(eventId ?? '') });
  const regQuery = useQuery({ queryKey: ['organizer-registrations', eventId], queryFn: () => getRegistrations(eventId ?? '') });

  if (eventQuery.isLoading || regQuery.isLoading) return <Loader message="Loading registrations..." />;

  const registrations = regQuery.data || [];
  const confirmed = registrations.filter((r) => r.registration_status === 'CONFIRMED');
  const totalSeats = registrations.reduce((sum, r) => sum + (r.seats_booked || 0), 0);

  return (
    <div className="space-y-6">
      <Link to={`/organizer/events/${eventId}`} className="inline-flex items-center gap-2 text-sm text-muted hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to event
      </Link>

      <div>
        <h1 className="font-display text-3xl text-gray-900">Registrations</h1>
        <p className="mt-1 text-muted">{eventQuery.data?.title}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span>{registrations.length} bookings</span>
          <span>{confirmed.length} confirmed</span>
          <span>{totalSeats} seats booked</span>
        </div>
      </div>

      {regQuery.isError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{regQuery.error.message}</p>}

      {registrations.length === 0 ? (
        <EmptyState icon={Users} title="No registrations yet" description="Registrations will appear here once users book." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Registrant</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Seats</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {registrations.map((r) => (
                  <tr key={r.registration_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.registrant_name}</td>
                    <td className="px-4 py-3">
                      <p>{r.registrant_phone}</p>
                      {r.registrant_email && <p className="text-xs text-muted">{r.registrant_email}</p>}
                    </td>
                    <td className="px-4 py-3">{r.seats_booked}</td>
                    <td className="px-4 py-3">{formatCurrency(r.total_amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.registration_status} /></td>
                    <td className="px-4 py-3">
                      {r.payment_status ? <StatusBadge status={r.payment_status} /> : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {r.receipt_available ? (
                        <span className="inline-flex items-center gap-1 text-xs text-success">
                          <Receipt className="h-3.5 w-3.5" /> {r.receipt_number}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
