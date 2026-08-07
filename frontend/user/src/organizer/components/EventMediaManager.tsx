import { useRef, useState } from 'react';
import { ImagePlus, Trash2, Video } from 'lucide-react';
import Button from '@shared/components/common/Button';
import { deleteBanner, deleteEventMedia, uploadBanner, uploadEventMedia } from '@organizer/api/organizerApi';
import { showError, showSuccess } from '@shared/utils/toast';
import type { ChangeEvent } from 'react';
import type { Event, EventMedia } from '@shared/types/api';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/webm'];
const DEFAULT_MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const DEFAULT_MAX_VIDEO_BYTES = 50 * 1024 * 1024;

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const MAX_IMAGE_BYTES = positiveInteger(import.meta.env.VITE_IMAGE_MAX_BYTES, DEFAULT_MAX_IMAGE_BYTES);
const MAX_VIDEO_BYTES = positiveInteger(import.meta.env.VITE_VIDEO_MAX_BYTES, DEFAULT_MAX_VIDEO_BYTES);

function formatMegabytes(bytes: number) {
  return `${bytes / (1024 * 1024)} MB`;
}

function validateFiles(files: FileList | File[], type: 'IMAGE' | 'VIDEO') {
  const permitted = type === 'IMAGE' ? IMAGE_TYPES : VIDEO_TYPES;
  const maximum = type === 'IMAGE' ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  return [...files].filter((file) => permitted.includes(file.type) && file.size <= maximum);
}

interface EventMediaManagerProps {
  event: Event;
  onChanged: () => void | Promise<void>;
}

export default function EventMediaManager({ event, onChanged }: EventMediaManagerProps) {
  const [loading, setLoading] = useState(false);
  const bannerInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null, type: 'IMAGE' | 'VIDEO', isBanner = false) {
    if (!files) return;
    const validFiles = validateFiles(files, type);
    if (!validFiles.length) {
      const limit = type === 'IMAGE' ? formatMegabytes(MAX_IMAGE_BYTES) : formatMegabytes(MAX_VIDEO_BYTES);
      showError(`Choose ${type === 'IMAGE' ? 'a JPEG, PNG, or WebP image' : 'an MP4 or WebM video'} up to ${limit}.`);
      return;
    }
    if (validFiles.length !== files.length) {
      showError('Some files were skipped because their type or size is invalid.');
    }
    setLoading(true);
    try {
      if (isBanner) await uploadBanner(event.event_id, validFiles[0]);
      else await Promise.all(validFiles.map((file) => uploadEventMedia(event.event_id, file, type)));
      showSuccess(isBanner ? 'Banner updated' : `${validFiles.length} media file(s) uploaded`);
      await onChanged();
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }

  async function remove(mediaId: string | null, isBanner = false) {
    setLoading(true);
    try {
      if (isBanner) await deleteBanner(event.event_id);
      else if (mediaId) await deleteEventMedia(event.event_id, mediaId);
      showSuccess(isBanner ? 'Banner removed' : 'Media removed');
      await onChanged();
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Multimedia</h3>
          <p className="mt-1 text-sm text-muted">Optional banner, gallery images, and videos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" disabled={loading} onClick={() => bannerInput.current?.click()}>
            <ImagePlus className="mr-2 h-4 w-4" /> {event.banner_url ? 'Replace banner' : 'Upload banner'}
          </Button>
          <Button type="button" variant="secondary" disabled={loading} onClick={() => imageInput.current?.click()}>
            <ImagePlus className="mr-2 h-4 w-4" /> Add images
          </Button>
          <Button type="button" variant="secondary" disabled={loading} onClick={() => videoInput.current?.click()}>
            <Video className="mr-2 h-4 w-4" /> Add videos
          </Button>
        </div>
      </div>

      <input ref={bannerInput} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e: ChangeEvent<HTMLInputElement>) => upload(e.target.files, 'IMAGE', true)} />
      <input ref={imageInput} className="hidden" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(e: ChangeEvent<HTMLInputElement>) => upload(e.target.files, 'IMAGE')} />
      <input ref={videoInput} className="hidden" type="file" multiple accept="video/mp4,video/webm" onChange={(e: ChangeEvent<HTMLInputElement>) => upload(e.target.files, 'VIDEO')} />

      <div className="mt-5 space-y-5">
        <div>
          <p className="mb-2 text-sm font-medium text-gray-900">Banner</p>
          <div className="relative overflow-hidden rounded-xl border border-border">
            <img src={event.banner_url || '/event-placeholder.svg'} alt="Event banner" className="h-44 w-full object-cover" />
            {event.banner_url && <button type="button" aria-label="Delete banner" disabled={loading} onClick={() => remove(null, true)} className="absolute right-2 top-2 rounded-full bg-white p-2 text-danger shadow"><Trash2 className="h-4 w-4" /></button>}
          </div>
        </div>
        {!!event.images?.length && <MediaGrid label="Images" media={event.images} loading={loading} onDelete={remove} />}
        {!!event.videos?.length && <MediaGrid label="Videos" media={event.videos} video loading={loading} onDelete={remove} />}
      </div>
    </section>
  );
}

interface MediaGridProps {
  label: string;
  media: EventMedia[];
  video?: boolean;
  loading: boolean;
  onDelete: (_mediaId: string) => Promise<void>;
}

function MediaGrid({ label, media, video = false, loading, onDelete }: MediaGridProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-900">{label}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {media.map((item) => (
          <div className="relative overflow-hidden rounded-xl border border-border" key={item.media_id}>
            {video ? <video controls className="h-44 w-full bg-black object-cover" src={item.media_url} /> : <img src={item.media_url} alt="" className="h-44 w-full object-cover" />}
            <button type="button" aria-label={`Delete ${label.slice(0, -1)}`} disabled={loading} onClick={() => onDelete(item.media_id)} className="absolute right-2 top-2 rounded-full bg-white p-2 text-danger shadow"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function validatePendingMedia(media: { banner: File | null; images: File[]; videos: File[] }) {
  return {
    banner: media.banner ? validateFiles([media.banner], 'IMAGE')[0] : null,
    images: validateFiles(media.images || [], 'IMAGE'),
    videos: validateFiles(media.videos || [], 'VIDEO'),
  };
}
