import EventCard from '@registrant/components/event/EventCard';
import EmptyState from '@shared/components/common/EmptyState';
import Button from '@shared/components/common/Button';
import { CalendarSearch } from 'lucide-react';
import type { Event } from '@shared/types/api';

interface EventGridProps {
  events?: Event[];
  onClearFilters?: () => void;
  isFiltered: boolean;
}

export default function EventGrid({ events, onClearFilters, isFiltered }: EventGridProps) {
  if (!events?.length) {
    return (
      <EmptyState
        icon={CalendarSearch}
        title={isFiltered ? 'No events match your search' : 'No events available yet'}
        description={
          isFiltered
            ? 'Try different keywords, broaden your filters, or browse all events.'
            : 'Check back soon — new events are added regularly by organizers across the platform.'
        }
        action={
          isFiltered && onClearFilters ? (
            <Button variant="secondary" onClick={onClearFilters}>
              Clear filters & browse all
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
      {events.map((event, index) => (
        <div
          key={event.event_id}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          style={{ animationDelay: `${Math.min(index * 50, 300)}ms`, animationFillMode: 'both' }}
        >
          <EventCard event={event} />
        </div>
      ))}
    </div>
  );
}
