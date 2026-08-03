import { Link } from 'react-router-dom';
import {
  MapPin, Calendar, Clock, Users, Tag, ArrowRight, Building2,
} from 'lucide-react';
import { formatCurrency, formatDateShort, formatTime } from '../../utils/constants';
import { cn } from '../../utils/cn';
import type { Event } from '../../types/api';

const TYPE_GRADIENTS = {
  ONLINE: 'from-violet-600 to-indigo-800',
  OFFLINE: 'from-brand-600 to-brand-900',
  HYBRID: 'from-teal-600 to-cyan-800',
};

function RegistrationBadge({ status }: { status?: Event['registration_status'] }) {
  const isOpen = status === 'OPEN';
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600',
      )}
    >
      {isOpen ? 'Open' : 'Closed'}
    </span>
  );
}

export default function EventCard({ event, featured = false }: { event: Event; featured?: boolean }) {
  const isFree = event.is_free || Number(event.ticket_price) === 0;
  const gradient = TYPE_GRADIENTS[event.event_type] || TYPE_GRADIENTS.OFFLINE;
  const location = event.event_type === 'ONLINE'
    ? 'Online event'
    : [event.venue, event.city].filter(Boolean).join(', ') || 'Venue TBA';

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        featured && 'ring-2 ring-brand-200 ring-offset-2',
      )}
    >
      <div className={cn('relative h-44 bg-gradient-to-br p-5', gradient)}>
        <img
          src={event.banner_url || '/event-placeholder.svg'}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative flex items-start justify-between gap-2">
          <span className="inline-flex rounded-full bg-black px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {event.category_name}
          </span>
          <RegistrationBadge status={event.registration_status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="relative mt-3 line-clamp-2 font-display text-2xl text-black font-extrabold ">
          {event.title}
        </h3>
        {/* {event.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">{event.description}</p>
        )} */}

        <p className="line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-muted">
          {event.description || "\u00A0"}
        </p>

        <div className="space-y-2 text-sm text-muted">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-brand-600" />
            <span>{formatDateShort(event.start_datetime)}</span>
            <Clock className="ml-1 h-3.5 w-3.5 shrink-0 opacity-60" />
            <span>{formatTime(event.start_datetime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-brand-600" />
            <span className="line-clamp-1">{location}</span>
          </div>
          {event.organizer_name && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0 text-brand-600" />
              <span className="line-clamp-1">{event.organizer_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-brand-600" />
            <span>{event.available_seats} of {event.capacity} seats available</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <div>
            <span className={cn('text-lg font-bold', isFree ? 'text-success' : 'text-gray-900')}>
              {isFree ? 'Free' : formatCurrency(event.ticket_price)}
            </span>
            {!isFree && (
              <span className="ml-1 text-xs text-muted">+ fees</span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
            <Tag className="h-3 w-3" />
            {event.event_type}
          </span>
        </div>

        <Link
          to={`/events/${event.event_id}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          View Details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
