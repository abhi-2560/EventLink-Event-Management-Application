import { MapPin, Calendar, Users, Globe, Building2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/constants';
import type { ComponentType, ReactNode } from 'react';
import type { Event } from '../../types/api';

export default function EventInfo({ event }: { event: Event }) {
  const isFree = event.is_free || Number(event.ticket_price) === 0;

  return (
    <div className="space-y-6">
      <img
        src={event.banner_url || '/event-placeholder.svg'}
        alt={`${event.title} banner`}
        className="h-64 w-full rounded-2xl object-cover"
      />
      <div>
        <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
          {event.category_name}
        </span>
        <h1 className="mt-3 font-display text-4xl text-gray-900 sm:text-5xl">{event.title}</h1>
        {event.description && (
          <p className="mt-4 text-base leading-relaxed text-gray-600">{event.description}</p>
        )}
      </div>

      {event.images && event.images.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Gallery</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {event.images.map((image) => (
              <img key={image.media_id} src={image.media_url} alt="" className="h-48 w-full rounded-xl object-cover" />
            ))}
          </div>
        </section>
      )}

      {event.videos && event.videos.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Videos</h2>
          <div className="space-y-4">
            {event.videos.map((video) => (
              <video key={video.media_id} controls className="w-full rounded-xl" src={video.media_url} />
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoRow icon={Calendar} label="Date & time" value={formatDate(event.start_datetime)} />
        <InfoRow icon={Globe} label="Type" value={event.event_type} />
        {event.city && (
          <InfoRow icon={MapPin} label="Location" value={[event.venue, event.city, event.state].filter(Boolean).join(', ')} />
        )}
        <InfoRow icon={Users} label="Availability" value={`${event.available_seats} of ${event.capacity} seats left`} />
        <InfoRow icon={Building2} label="Organizer" value={event.organizer_name} />
      </div>

      <div className="rounded-2xl border border-border bg-brand-50/50 p-6">
        <p className="text-sm font-medium text-muted">Ticket price</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">
          {isFree ? 'Free' : formatCurrency(event.ticket_price)}
        </p>
        {!isFree && (Number(event.convenience_fee) > 0 || Number(event.gateway_fee) > 0) && (
          <p className="mt-2 text-sm text-muted">
            + {formatCurrency(event.convenience_fee)} convenience fee
            {Number(event.gateway_fee) > 0 && ` + ${formatCurrency(event.gateway_fee)} gateway fee`}
          </p>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-white p-4">
      <div className="rounded-lg bg-brand-50 p-2 text-brand-600">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
