import EventCard from './EventCard';
import EmptyState from '../common/EmptyState';
import { CalendarSearch } from 'lucide-react';

export default function EventGrid({ events }) {
  if (!events?.length) {
    return (
      <EmptyState
        icon={CalendarSearch}
        title="No events found"
        description="Try adjusting your search filters or check back later for new events."
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.event_id} event={event} />
      ))}
    </div>
  );
}
