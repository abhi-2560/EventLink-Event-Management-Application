import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/constants';

export default function RegistrationCard({ event }) {
  const isClosed = event.registration_status === 'CLOSED';
  const soldOut = event.available_seats <= 0;
  const isFree = event.is_free || Number(event.ticket_price) === 0;

  return (
    <div className="sticky top-24 rounded-2xl border border-border bg-white p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900">Register for this event</h3>
      <p className="mt-1 text-sm text-muted">
        {soldOut ? 'This event is sold out.' : `${event.available_seats} seats available`}
      </p>

      <div className="my-6 border-y border-border py-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Price per seat</span>
          <span className="font-semibold">{isFree ? 'Free' : formatCurrency(event.ticket_price)}</span>
        </div>
      </div>

      {isClosed ? (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Registration is closed for this event.
        </p>
      ) : soldOut ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          All seats have been booked.
        </p>
      ) : (
        <Link to={`/events/${event.event_id}/register`}>
          <Button className="w-full" size="lg">
            <Ticket className="h-4 w-4" />
            Register Now
          </Button>
        </Link>
      )}
    </div>
  );
}
