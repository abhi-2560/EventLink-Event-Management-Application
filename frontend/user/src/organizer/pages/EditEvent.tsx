import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import EventForm from '@organizer/components/EventForm';
import EventMediaManager from '@organizer/components/EventMediaManager';
import Loader from '@shared/components/common/Loader';
import { getEvent, updateEvent } from '@organizer/api/organizerApi';
import { eventToFormDefaults } from '@organizer/schemas/organizerSchemas';
import { showError, showSuccess } from '@shared/utils/toast';
import { toApiError } from '@shared/utils/apiError';
import { formToEventPayload } from '@organizer/schemas/organizerSchemas';

export default function EditEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: event, isLoading, isError, error } = useQuery({
    queryKey: ['organizer-event', eventId],
    queryFn: () => getEvent(eventId ?? ''),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: ReturnType<typeof formToEventPayload>) => updateEvent(eventId ?? '', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      showSuccess('Event updated successfully');
      navigate(`/organizer/events/${eventId}`);
    },
    onError: showError,
  });

  if (isLoading) return <Loader message="Loading event..." />;
  if (isError) return <p className="text-sm text-danger">{toApiError(error).message}</p>;
  if (!event) return <p className="text-sm text-danger">Event not found.</p>;

  const bookedSeats = event.capacity - event.available_seats;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl text-gray-900">Edit Event</h1>
        <p className="mt-1 text-muted">{event.title}</p>
        {event.status === 'PUBLISHED' && bookedSeats > 0 && (
          <p className="mt-2 text-sm text-amber-700">
            This event is published with {bookedSeats} seat{bookedSeats === 1 ? '' : 's'} booked. Capacity cannot go below {bookedSeats}.
          </p>
        )}
      </div>

      <EventForm
        defaultValues={eventToFormDefaults(event)}
        onSubmit={(payload) => updateMutation.mutate(payload)}
        loading={updateMutation.isPending}
        submitLabel="Update Event"
        isEdit
        minCapacity={Math.max(bookedSeats, 1)}
      />
      <EventMediaManager
        event={event}
        onChanged={async () => {
          await queryClient.invalidateQueries({ queryKey: ['organizer-event', eventId] });
          await queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
        }}
      />
    </div>
  );
}
