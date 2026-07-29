import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  category_id: z.string().uuid('Select a category'),
  event_type: z.enum(['ONLINE', 'OFFLINE', 'HYBRID'], { required_error: 'Select event type' }),
  venue: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  meeting_link: z.string().url('Invalid URL').optional().or(z.literal('')),
  keywords: z.string().optional(),
  ticket_price: z.coerce.number().min(0, 'Price must be 0 or more'),
  is_free: z.boolean(),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
  registration_start: z.string().optional(),
  registration_end: z.string().optional(),
  start_datetime: z.string().min(1, 'Start date is required'),
  registration_status: z.enum(['OPEN', 'CLOSED']).optional(),
}).superRefine((data, ctx) => {
  if (data.event_type === 'OFFLINE' && !data.city) {
    ctx.addIssue({ code: 'custom', message: 'City is required for offline events', path: ['city'] });
  }
  if ((data.event_type === 'ONLINE' || data.event_type === 'HYBRID') && !data.meeting_link) {
    ctx.addIssue({ code: 'custom', message: 'Meeting link is required', path: ['meeting_link'] });
  }
  if (data.is_free && data.ticket_price !== 0) {
    ctx.addIssue({ code: 'custom', message: 'Free events must have price 0', path: ['ticket_price'] });
  }
});

export const profileSchema = z.object({
  organizer_name: z.string().min(2, 'Organization name required'),
  contact_person: z.string().min(2, 'Contact person required'),
  phone: z.string().min(10, 'Valid phone required'),
});

export const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password required'),
  new_password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string().min(1, 'Confirm password'),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Must include a lowercase letter')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[0-9]/, 'Must include a number');

export const signupSchema = z.object({
  organizer_name: z.string().min(2, 'Organization name is required'),
  contact_person: z.string().min(2, 'Contact person is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z
    .string()
    .min(10, 'Enter a valid phone number')
    .max(15, 'Phone number is too long')
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number'),
  password: strongPassword,
  confirm_password: z.string().min(1, 'Confirm your password'),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export function eventToFormDefaults(event) {
  if (!event) {
    return {
      title: '', description: '', category_id: '', event_type: 'OFFLINE',
      venue: '', city: '', state: '', country: 'India', meeting_link: '',
      keywords: '', ticket_price: 0, is_free: false, capacity: 100, registration_start: '', registration_end: '',
      start_datetime: '', registration_status: 'OPEN',
    };
  }
  return {
    title: event.title || '',
    description: event.description || '',
    category_id: event.category_id || '',
    event_type: event.event_type || 'OFFLINE',
    venue: event.venue || '',
    city: event.city || '',
    state: event.state || '',
    country: event.country || 'India',
    meeting_link: event.meeting_link || '',
    keywords: (event.keywords || []).join(', '),
    ticket_price: Number(event.ticket_price || 0),
    is_free: event.is_free || false,
    capacity: event.capacity || 100,
    registration_start: event.registration_start?.slice(0, 16) || '',
    registration_end: event.registration_end?.slice(0, 16) || '',
    start_datetime: event.start_datetime?.slice(0, 16) || '',
    registration_status: event.registration_status || 'OPEN',
  };
}

export function formToEventPayload(data) {
  const keywords = data.keywords
    ? data.keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : [];
  return {
    title: data.title,
    description: data.description || undefined,
    category_id: data.category_id,
    event_type: data.event_type,
    venue: data.venue || undefined,
    city: data.city || undefined,
    state: data.state || undefined,
    country: data.country || undefined,
    meeting_link: data.meeting_link || undefined,
    keywords: keywords.length ? keywords : undefined,
    ticket_price: data.is_free ? 0 : data.ticket_price,
    is_free: data.is_free,
    capacity: data.capacity,
    registration_start: data.registration_start ? new Date(data.registration_start).toISOString() : undefined,
    registration_end: data.registration_end ? new Date(data.registration_end).toISOString() : undefined,
    start_datetime: new Date(data.start_datetime).toISOString(),
    registration_status: data.registration_status,
  };
}
