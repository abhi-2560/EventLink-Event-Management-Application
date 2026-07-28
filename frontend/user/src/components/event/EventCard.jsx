import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Tag } from 'lucide-react';
import { formatCurrency, formatDateShort } from '../../utils/constants';
import { cn } from '../../utils/cn';

export default function EventCard({ event }) {
  const isFree = event.is_free || Number(event.ticket_price) === 0;

  return (
    <Link
      to={`/events/${event.event_id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-40 bg-gradient-to-br from-brand-600 to-brand-800 p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <span className="relative inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {event.category_name}
        </span>
        <h3 className="relative mt-3 line-clamp-2 font-display text-2xl text-white">
          {event.title}
        </h3>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>{formatDateShort(event.start_datetime)}</span>
        </div>
        {event.city && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{event.city}{event.venue ? ` · ${event.venue}` : ''}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted">
          <Users className="h-4 w-4 shrink-0" />
          <span>{event.available_seats} seats available</span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <span className={cn('text-lg font-semibold', isFree ? 'text-success' : 'text-gray-900')}>
            {isFree ? 'Free' : formatCurrency(event.ticket_price)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
            <Tag className="h-3 w-3" />
            {event.event_type}
          </span>
        </div>
      </div>
    </Link>
  );
}
