import { useQuery } from '@tanstack/react-query';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import EventTable from '../../components/organizer/EventTable';
import { getEvents } from '../../api/organizerApi';
import { CalendarDays } from 'lucide-react';
import CreateEvent from './CreateEvent';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/common/Button';

export default function OrganizerEvents() {
  const { data: events, isLoading, isError, error } = useQuery({
    queryKey: ['organizer-events'],
    queryFn: getEvents,
  });

  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-gray-900">My Events</h1>
        <p className="mt-1 text-muted">Manage all your events in one place</p>
      </div>

      {isLoading && <Loader message="Loading events..." />}
      {isError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>}
      {/* {!isLoading && !isError && events?.length === 0 && (
        <EmptyState icon={CalendarDays} 
        title="No events yet" description="Create your first event to get started."
        />
      )} */}

      {!isLoading && !isError && events?.length === 0 && (
        <>
          <EmptyState
            icon={CalendarDays}
            title="No events yet"
            description="Create your first event to get started."
          />
          <div className='flex items-center justify-center '>

          <Button
            onClick={() => navigate('/organizer/events/new')}
            >
            Create Event
          </Button>
            </div>
        </>
      )}

      {!isLoading && !isError && events?.length > 0 && <EventTable events={events} />}
    </div>
  );
}
