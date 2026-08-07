import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Container from '@shared/components/common/Container';
import Loader from '@shared/components/common/Loader';
import EventInfo from '@registrant/components/event/EventInfo';
import RegistrationCard from '@registrant/components/event/RegistrationCard';
import { getEvent } from '@registrant/api/eventApi';

export default function EventDetails() {
  const { eventId } = useParams();

  const { data: event, isLoading, isError, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId ?? ''),
  });

  if (isLoading) {
    return (
      <Container className="py-16">
        <Loader message="Loading event..." />
      </Container>
    );
  }

  if (isError || !event) {
    return (
      <Container className="py-16">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error?.message || 'Event not found'}</p>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm text-brand-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to events
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> All events
      </Link>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EventInfo event={event} />
        </div>
        <div>
          <RegistrationCard event={event} />
        </div>
      </div>
    </Container>
  );
}
