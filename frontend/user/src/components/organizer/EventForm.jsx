import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import Input, { Select, Textarea } from '../common/Input';
import Button from '../common/Button';
import { getCategories } from '../../api/organizerApi';
import { eventSchema, formToEventPayload } from '../../schemas/organizerSchemas';
import Loader from '../common/Loader';

export default function EventForm({
  defaultValues,
  onSubmit,
  loading,
  submitLabel = 'Save Event',
  showPublish = false,
  onPublish,
  isEdit = false,
  minCapacity = 1,
}) {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['organizer-categories'],
    queryFn: getCategories,
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

  const isFree = watch('is_free');
  const eventType = watch('event_type');

  if (isLoading) return <Loader message="Loading form..." />;

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(formToEventPayload(data)))} className="space-y-8">
      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Basic details</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label="Title" required {...register('title')} error={errors.title?.message} />
          </div>
          <div className="sm:col-span-2">
            <Textarea label="Description" {...register('description')} />
          </div>
          <Select label="Category" required {...register('category_id')} error={errors.category_id?.message}>
            <option value="">Select category</option>
            {categories?.map((c) => (
              <option key={c.category_id} value={c.category_id}>{c.name}</option>
            ))}
          </Select>
          <Select label="Event type" required {...register('event_type')}>
            <option value="OFFLINE">Offline</option>
            <option value="ONLINE">Online</option>
            <option value="HYBRID">Hybrid</option>
          </Select>
          <Input label="Keywords (comma-separated)" {...register('keywords')} placeholder="conference, ai, workshop" />
          <Input label="Start date & time" type="datetime-local" required {...register('start_datetime')} error={errors.start_datetime?.message} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Location</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(eventType === 'OFFLINE' || eventType === 'HYBRID') && (
            <>
              <Input label="Venue" {...register('venue')} />
              <Input label="City" required {...register('city')} error={errors.city?.message} />
              <Input label="State" {...register('state')} />
              <Input label="Country" {...register('country')} />
            </>
          )}
          {(eventType === 'ONLINE' || eventType === 'HYBRID') && (
            <div className="sm:col-span-2">
              <Input label="Meeting link" required {...register('meeting_link')} error={errors.meeting_link?.message} />
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Tickets & capacity</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Capacity"
            type="number"
            min={minCapacity}
            required
            {...register('capacity', { valueAsNumber: true })}
            error={errors.capacity?.message}
          />
          <div className="flex items-end gap-3 pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('is_free')} className="rounded border-border" />
              Free event
            </label>
          </div>
          {!isFree && (
            <Input label="Ticket price (INR)" type="number" min={0} step="0.01" required {...register('ticket_price', { valueAsNumber: true })} error={errors.ticket_price?.message} />
          )}
          {isEdit && (
            <Select label="Registration status" required {...register('registration_status')}>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </Select>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Registration window</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input label="Registration opens" type="datetime-local" {...register('registration_start')} />
          <Input label="Registration closes" type="datetime-local" {...register('registration_end')} />
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={loading}>{submitLabel}</Button>
        {showPublish && onPublish && (
          <Button
            type="button"
            variant="success"
            loading={loading}
            onClick={handleSubmit((data) => onPublish(formToEventPayload(data)))}
          >
            Publish Event
          </Button>
        )}
      </div>
    </form>
  );
}
