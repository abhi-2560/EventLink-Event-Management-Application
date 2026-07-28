import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import EventForm from '../../components/organizer/EventForm';
import Loader from '../../components/common/Loader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { getEvent, updateEvent, updateCapacity } from '../../api/organizerApi';
import { eventToFormDefaults } from '../../schemas/organizerSchemas';
import { useState } from 'react';

export default function EditEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [capacity, setCapacity] = useState('');

  const { data: event, isLoading, isError, error } = useQuery({
    queryKey: ['organizer-event', eventId],
    queryFn: () => getEvent(eventId),
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => updateEvent(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      navigate(`/organizer/events/${eventId}`);
    },
  });

  const capacityMutation = useMutation({
    mutationFn: () => updateCapacity(eventId, Number(capacity)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-event', eventId] });
      setCapacity('');
    },
  });

  if (isLoading) return <Loader message="Loading event..." />;
  if (isError) return <p className="text-sm text-danger">{error.message}</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl text-gray-900">Edit Event</h1>
        <p className="mt-1 text-muted">{event.title}</p>
      </div>

      {(updateMutation.isError || capacityMutation.isError) && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {updateMutation.error?.message || capacityMutation.error?.message}
        </p>
      )}

      <EventForm
        defaultValues={eventToFormDefaults(event)}
        onSubmit={(payload) => updateMutation.mutate(payload)}
        loading={updateMutation.isPending}
        submitLabel="Update Event"
      />

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Update capacity</h3>
        <p className="mt-1 text-sm text-muted">Current: {event.capacity} (booked: {event.capacity - event.available_seats})</p>
        <div className="mt-4 flex gap-3">
          <Input
            type="number"
            min={event.capacity - event.available_seats}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="New capacity"
          />
          <Button onClick={() => capacityMutation.mutate()} loading={capacityMutation.isPending} disabled={!capacity}>
            Update Capacity
          </Button>
        </div>
      </div>
    </div>
  );
}
