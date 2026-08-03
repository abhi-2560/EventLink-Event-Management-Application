import { Link, useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import Loader from '../components/ui/Loader';
import Input, { Select, Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import { getEvent, updateEvent } from '../api/adminApi';
import { eventSchema } from '../schemas/adminSchemas';
import type { Event, EventPayload } from '../types/admin';
import type { z } from 'zod';

type EventForm = z.infer<typeof eventSchema>;

function toForm(e: Event): EventForm {
  return {
    title: e.title, description: e.description || '', event_type: e.event_type,
    venue: e.venue || '', city: e.city || '', state: e.state || '', country: e.country || '',
    meeting_link: e.meeting_link || '', ticket_price: Number(e.ticket_price || 0),
    is_free: e.is_free || false, capacity: e.capacity,
    registration_start: e.registration_start?.slice(0, 16) || '',
    registration_end: e.registration_end?.slice(0, 16) || '',
    start_datetime: e.start_datetime?.slice(0, 16) || '',
  };
}

export default function EditEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-event', eventId],
    queryFn: () => getEvent(eventId ?? ''),
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(eventSchema),
    values: data ? toForm(data as Event) : undefined,
  });

  const isFree = watch('is_free');
  const eventType = watch('event_type');

  const mutation = useMutation({
    mutationFn: (payload: EventForm) => updateEvent(eventId ?? '', {
      ...payload,
      ticket_price: payload.is_free ? 0 : payload.ticket_price,
      start_datetime: new Date(payload.start_datetime).toISOString(),
      registration_start: payload.registration_start ? new Date(payload.registration_start).toISOString() : undefined,
      registration_end: payload.registration_end ? new Date(payload.registration_end).toISOString() : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event', eventId] });
      navigate(`/events/${eventId}`);
    },
  });

  if (isLoading) return <Loader />;
  if (isError) return <p className="text-danger">{error.message}</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to={`/events/${eventId}`} className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent"><ArrowLeft className="h-4 w-4" />Back</Link>
      <h1 className="text-2xl font-bold">Edit Event</h1>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
        <Input label="Title" required {...register('title')} error={errors.title?.message} />
        <Textarea label="Description" {...register('description')} />
        <Select label="Event Type" {...register('event_type')}>
          <option value="OFFLINE">Offline</option><option value="ONLINE">Online</option><option value="HYBRID">Hybrid</option>
        </Select>
        {(eventType === 'OFFLINE' || eventType === 'HYBRID') && (
          <><Input label="Venue" {...register('venue')} /><Input label="City" {...register('city')} /><Input label="State" {...register('state')} /></>
        )}
        {(eventType === 'ONLINE' || eventType === 'HYBRID') && <Input label="Meeting Link" {...register('meeting_link')} />}
        <Input label="Start Date & Time" type="datetime-local" required {...register('start_datetime')} error={errors.start_datetime?.message} />
        <Input label="Capacity" type="number" required {...register('capacity', { valueAsNumber: true })} error={errors.capacity?.message} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('is_free')} />Free event</label>
        {!isFree && <Input label="Ticket Price" type="number" step="0.01" {...register('ticket_price', { valueAsNumber: true })} />}
        <Input label="Registration Opens" type="datetime-local" {...register('registration_start')} />
        <Input label="Registration Closes" type="datetime-local" {...register('registration_end')} />
        {mutation.isError && <p className="text-sm text-danger">{mutation.error.message}</p>}
        <Button type="submit" loading={mutation.isPending}>Save Changes</Button>
      </form>
    </div>
  );
}
