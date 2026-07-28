import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import Input from '../common/Input';
import Button from '../common/Button';
import { getCategories } from '../../api/organizerApi';
import { eventSchema, formToEventPayload } from '../../schemas/organizerSchemas';
import Loader from '../common/Loader';

export default function EventForm({ defaultValues, onSubmit, loading, submitLabel = 'Save Event', showPublish = false, onPublish }) {
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
            <Input label="Title *" {...register('title')} error={errors.title?.message} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category *</label>
            <select {...register('category_id')} className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm">
              <option value="">Select category</option>
              {categories?.map((c) => (
                <option key={c.category_id} value={c.category_id}>{c.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="mt-1 text-xs text-danger">{errors.category_id.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Event type *</label>
            <select {...register('event_type')} className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm">
              <option value="OFFLINE">Offline</option>
              <option value="ONLINE">Online</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>
          <Input label="Keywords (comma-separated)" {...register('keywords')} placeholder="conference, ai, workshop" />
          <Input label="Start date & time *" type="datetime-local" {...register('start_datetime')} error={errors.start_datetime?.message} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Location</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(eventType === 'OFFLINE' || eventType === 'HYBRID') && (
            <>
              <Input label="Venue" {...register('venue')} />
              <Input label="City *" {...register('city')} error={errors.city?.message} />
              <Input label="State" {...register('state')} />
              <Input label="Country" {...register('country')} />
            </>
          )}
          {(eventType === 'ONLINE' || eventType === 'HYBRID') && (
            <div className="sm:col-span-2">
              <Input label="Meeting link *" {...register('meeting_link')} error={errors.meeting_link?.message} />
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Tickets & capacity</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input label="Capacity *" type="number" min={1} {...register('capacity', { valueAsNumber: true })} error={errors.capacity?.message} />
          <div className="flex items-end gap-3 pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('is_free')} className="rounded border-border" />
              Free event
            </label>
          </div>
          {!isFree && (
            <>
              <Input label="Ticket price (INR)" type="number" min={0} step="0.01" {...register('ticket_price', { valueAsNumber: true })} error={errors.ticket_price?.message} />
              <Input label="Convenience fee" type="number" min={0} step="0.01" {...register('convenience_fee', { valueAsNumber: true })} />
              <Input label="Gateway fee" type="number" min={0} step="0.01" {...register('gateway_fee', { valueAsNumber: true })} />
            </>
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
