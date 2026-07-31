import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import EventForm from '../../components/organizer/EventForm';
import { createEvent, publishEvent, uploadBanner, uploadEventMedia } from '../../api/organizerApi';
import { validatePendingMedia } from '../../components/organizer/EventMediaManager';
import { eventToFormDefaults } from '../../schemas/organizerSchemas';
import { showError, showSuccess, showWarning } from '../../utils/toast';

export default function CreateEvent() {
  const navigate = useNavigate();

  const uploadSelectedMedia = async (eventId, media) => {
    const valid = validatePendingMedia(media);
    try {
      if (valid.banner) await uploadBanner(eventId, valid.banner);
      await Promise.all(valid.images.map((file) => uploadEventMedia(eventId, file, 'IMAGE')));
      await Promise.all(valid.videos.map((file) => uploadEventMedia(eventId, file, 'VIDEO')));
    } catch (error) {
      showWarning('Event was created, but some media could not be uploaded. You can retry it from Edit Event.');
    }
  };

  const saveMutation = useMutation({
    mutationFn: async ({ payload, media }) => {
      const event = await createEvent(payload);
      await uploadSelectedMedia(event.event_id, media);
      return event;
    },
    onSuccess: (event) => {
      showSuccess('Event saved as draft');
      navigate(`/organizer/events/${event.event_id}`);
    },
    onError: showError,
  });

  const publishMutation = useMutation({
    mutationFn: async ({ payload, media }) => {
      const event = await createEvent(payload);
      await uploadSelectedMedia(event.event_id, media);
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
        onSubmit={(payload, media) => saveMutation.mutate({ payload, media })}
        loading={loading}
        submitLabel="Save as Draft"
        showPublish
        onPublish={(payload, media) => publishMutation.mutate({ payload, media })}
      />
    </div>
  );
}
