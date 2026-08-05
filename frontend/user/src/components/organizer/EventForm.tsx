import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import Input, { Select, Textarea } from '../common/Input';
import Button from '../common/Button';
import { getCategories } from '../../api/organizerApi';
import { eventSchema, formToEventPayload } from '../../schemas/organizerSchemas';
import type { EventFormValues } from '../../schemas/organizerSchemas';
import type { DefaultValues, FieldError } from 'react-hook-form';
import Loader from '../common/Loader';

import { showSuccess } from '../../utils/toast';
import { DeleteIcon } from 'lucide-react';

interface EventMediaUpload {
  banner: File | null;
  images: File[];
  videos: File[];
}

interface EventFormProps {
  defaultValues: DefaultValues<EventFormValues>;
  onSubmit: (payload: ReturnType<typeof formToEventPayload>, media: EventMediaUpload) => void | Promise<void>;
  loading: boolean;
  submitLabel?: string;
  showPublish?: boolean;
  onPublish?: (payload: ReturnType<typeof formToEventPayload>, media: EventMediaUpload) => void | Promise<void>;
  isEdit?: boolean;
  minCapacity?: number;
}

const errorMessage = (error: FieldError | undefined) => error?.message;

export default function EventForm({
  defaultValues,
  onSubmit,
  loading,
  submitLabel = 'Save Event',
  showPublish = false,
  onPublish,
  isEdit = false,
  minCapacity = 1,
}: EventFormProps) {
  const [media, setMedia] = useState<EventMediaUpload>({ banner: null, images: [], videos: [] });
  const { data: categories, isLoading } = useQuery({
    queryKey: ['organizer-categories'],
    queryFn: getCategories,
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

  const isFree = watch('is_free');
  const eventType = watch('event_type');

  if (isLoading) return <Loader message="Loading form..." />;

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(formToEventPayload(data), media))} className="space-y-8">
      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Basic details</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label="Title" required {...register('title')} error={errorMessage(errors.title)} />
          </div>
          <div className="sm:col-span-2">
            <Textarea label="Description" {...register('description')} />
          </div>
          <Select label="Category" required {...register('category_id')} error={errorMessage(errors.category_id)}>
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
          <Input label="Start date & time" type="datetime-local" required {...register('start_datetime')} error={errorMessage(errors.start_datetime)} />
        </div>
      </section>
      {/* 
      {!isEdit && (
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Multimedia</h3>
          <p className="mt-1 text-sm text-muted">Optional files are uploaded after the event is created.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <FileField label="Banner image" accept="image/jpeg,image/png,image/webp" onChange={(files) => setMedia((current) => ({ ...current, banner: files[0] || null }))} />
            <FileField label="Gallery images" accept="image/jpeg,image/png,image/webp" multiple onChange={(files) => setMedia((current) => ({ ...current, images: [...files] }))} />
            <FileField label="Videos" accept="video/mp4,video/webm" multiple onChange={(files) => setMedia((current) => ({ ...current, videos: [...files] }))} />
          </div>
          <p className="mt-3 text-xs text-muted">Images: JPEG, PNG, or WebP up to 5 MB. Videos: MP4 or WebM up to 50 MB.</p>
        </section>
      )} */}


      {!isEdit && (
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Multimedia</h3>
              <p className="mt-1 text-sm text-muted">
                Optional banner, gallery images, and videos.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-border p-4">
              {/* <FileField
                label="Banner image"
                accept="image/jpeg,image/png,image/webp"
                onChange={(files) =>
                  setMedia((current) => ({
                    ...current,
                    banner: files[0] || null,
                  }))
                }
              /> */}

              <FileField
                label="Banner image"
                accept="image/jpeg,image/png,image/webp"
                onChange={(files) => {
                  setMedia((current) => ({
                    ...current,
                    banner: files[0] || null,
                  }));

                  if (files.length > 0) {
                    showSuccess('Banner image selected');
                  }
                }}
              />

            </div>



            <div className="rounded-xl border border-border p-4">
              <FileField
                label="Gallery images"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(files) => {
                  setMedia((current) => ({
                    ...current,
                    images: [...files],
                  }));

                  if (files.length > 0) {
                    showSuccess(`${files.length} image${files.length > 1 ? 's' : ''} selected`);
                  }
                }}
              />
            </div>

            <div className="rounded-xl border border-border p-4">
              <FileField
                label="Videos"
                accept="video/mp4,video/webm"
                multiple
                onChange={(files) => {
                  setMedia((current) => ({
                    ...current,
                    images: [...files],
                  }));

                  if (files.length > 0) {
                    showSuccess(`${files.length} video${files.length > 1 ? 's' : ''} selected`);
                  }
                }}
              />
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-border bg-slate-50 p-4">
            <p className="text-sm font-medium text-gray-900">
              Upload Requirements
            </p>
            <p className="mt-1 text-sm text-muted">
              Images: JPEG, PNG, or WebP up to <strong>5 MB</strong>.
              <br />
              Videos: MP4 or WebM up to <strong>50 MB</strong>.
            </p>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Location</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(eventType === 'OFFLINE' || eventType === 'HYBRID') && (
            <>
              <Input label="Venue" {...register('venue')} />
              <Input label="City" required {...register('city')} error={errorMessage(errors.city)} />
              <Input label="State" {...register('state')} />
              <Input label="Country" {...register('country')} />
            </>
          )}
          {(eventType === 'ONLINE' || eventType === 'HYBRID') && (
            <div className="sm:col-span-2">
              <Input label="Meeting link" required {...register('meeting_link')} error={errorMessage(errors.meeting_link)} />
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
            error={errorMessage(errors.capacity)}
          />
          <div className="flex items-end gap-3 pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('is_free')} className="rounded border-border" />
              Free event
            </label>
          </div>
          {!isFree && (
            <Input label="Ticket price (INR)" type="number" min={0} step="0.01" required {...register('ticket_price', { valueAsNumber: true })} error={errorMessage(errors.ticket_price)} />
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
            onClick={handleSubmit((data) => onPublish(formToEventPayload(data), media))}
          >
            Publish Event
          </Button>
        )}
      </div>
    </form>
  );
}

// function FileField({ label, accept, multiple = false, onChange }: {
//   label: string;
//   accept: string;
//   multiple?: boolean;
//   onChange: (files: File[]) => void;
// }) {
//   return (
//     <label className="block text-sm font-medium text-gray-700">
//       {label}
//       <input className="mt-1 block w-full text-sm text-muted" type="file" accept={accept} multiple={multiple} onChange={(event) => onChange(Array.from(event.target.files ?? []))} />
//     </label>
//   );
// }

import { useRef, useState } from 'react';
import { Trash } from 'lucide-react';

function FileField({
  label,
  accept,
  multiple = false,
  onChange,
}: {
  label: string;
  accept: string;
  multiple?: boolean;
  onChange: (files: File[]) => void;
}) {
  const [selectedCount, setSelectedCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const clearSelection = () => {
    setSelectedCount(0);
    onChange([]); // clear parent state

    if (inputRef.current) {
      inputRef.current.value = ''; // clear the file input
    }
  };

  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}

      <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-border bg-slate-100 px-1 py-1 text-sm font-bold text-gray-800 hover:bg-slate-200">
        Choose File
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            setSelectedCount(files.length);
            onChange(files);
          }}
        />
      </label>

      {selectedCount > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={clearSelection}
            className="rounded-full p-1 text-red-600 hover:bg-red-100"
          >
            <Trash className="h-4 w-4" />
          </button>

          <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700">
            {selectedCount} {selectedCount === 1 ? 'file' : 'files'} selected
          </span>
        </div>
      )}
    </label>
  );
}