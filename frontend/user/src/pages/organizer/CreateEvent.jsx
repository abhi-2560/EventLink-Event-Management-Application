import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import EventForm from '../../components/organizer/EventForm';
import { createEvent, publishEvent } from '../../api/organizerApi';
import { eventToFormDefaults } from '../../schemas/organizerSchemas';
import { showError, showSuccess } from '../../utils/toast';

export default function CreateEvent() {
  const navigate = useNavigate();

  const saveMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: (event) => {
      showSuccess('Event saved as draft');
      navigate(`/organizer/events/${event.event_id}`);
    },
    onError: showError,
  });

  const publishMutation = useMutation({
    mutationFn: async (payload) => {
      const event = await createEvent(payload);
      return publishEvent(event.event_id);
    },
    onSuccess: (event) => {
      showSuccess('Event published successfully');
      navigate(`/organizer/events/${event.event_id}`);
    },
    onError: showError,
  });

  const loading = saveMutation.isPending || publishMutation.isPending;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl text-gray-900">Create Event</h1>
        <p className="mt-1 text-muted">Events are saved as drafts until published</p>
      </div>
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
