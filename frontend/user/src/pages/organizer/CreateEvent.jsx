import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import EventForm from '../../components/organizer/EventForm';
import { createEvent, publishEvent } from '../../api/organizerApi';
import { eventToFormDefaults } from '../../schemas/organizerSchemas';

export default function CreateEvent() {
  const navigate = useNavigate();

  const saveMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: (event) => navigate(`/organizer/events/${event.event_id}`),
  });

  const publishMutation = useMutation({
    mutationFn: async (payload) => {
      const event = await createEvent(payload);
      return publishEvent(event.event_id);
    },
    onSuccess: (event) => navigate(`/organizer/events/${event.event_id}`),
  });

  const loading = saveMutation.isPending || publishMutation.isPending;
  const error = saveMutation.error || publishMutation.error;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl text-gray-900">Create Event</h1>
        <p className="mt-1 text-muted">Events are saved as drafts until published</p>
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>
      )}
      <EventForm
        defaultValues={eventToFormDefaults()}
        onSubmit={(payload) => saveMutation.mutate(payload)}
        loading={loading}
        submitLabel="Save as Draft"
        showPublish
        onPublish={(payload) => publishMutation.mutate(payload)}
      />
    </div>
  );
}
