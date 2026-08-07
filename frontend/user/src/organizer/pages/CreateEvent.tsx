import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import EventForm from '@organizer/components/EventForm';
import { createEvent, publishEvent, uploadBanner, uploadEventMedia } from '@organizer/api/organizerApi';
import { validatePendingMedia } from '@organizer/components/EventMediaManager';
import { eventToFormDefaults } from '@organizer/schemas/organizerSchemas';
import { showError, showSuccess, showWarning } from '@shared/utils/toast';
import type { Event } from '@shared/types/api';
import { formToEventPayload } from '@organizer/schemas/organizerSchemas';

interface EventMediaUpload {
  banner: File | null;
  images: File[];
  videos: File[];
}
type CreateEventVariables = {
  payload: ReturnType<typeof formToEventPayload>;
  media: EventMediaUpload;
};

export default function CreateEvent() {
  const navigate = useNavigate();

  const uploadSelectedMedia = async (eventId: string, media: EventMediaUpload) => {
    const valid = validatePendingMedia(media);
    try {
      if (valid.banner) await uploadBanner(eventId, valid.banner);
      await Promise.all(valid.images.map((file) => uploadEventMedia(eventId, file, 'IMAGE')));
      await Promise.all(valid.videos.map((file) => uploadEventMedia(eventId, file, 'VIDEO')));
    } catch (_error) {
      showWarning('Event was created, but some media could not be uploaded. You can retry it from Edit Event.');
    }
  };

  const saveMutation = useMutation<Event, Error, CreateEventVariables>({
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

  const publishMutation = useMutation<Event, Error, CreateEventVariables>({
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
        defaultValues={eventToFormDefaults(undefined)}
        onSubmit={(payload, media) => saveMutation.mutate({ payload, media })}
        loading={loading}
        submitLabel="Save as Draft"
        showPublish
        onPublish={(payload, media) => publishMutation.mutate({ payload, media })}
      />
    </div>
  );
}
