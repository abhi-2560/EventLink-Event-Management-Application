import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Name required'),
  description: z.string().optional(),
  is_default: z.boolean().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Name required'),
});

export const passwordSchema = z.object({
  current_password: z.string().min(1, 'Required'),
  new_password: z.string().min(6, 'Min 6 characters'),
  confirm_password: z.string().min(1, 'Required'),
}).refine((d) => d.new_password === d.confirm_password, { message: 'Passwords must match', path: ['confirm_password'] });

export const organizerSchema = z.object({
  organizer_name: z.string().min(2),
  contact_person: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
});

export const eventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  event_type: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']),
  venue: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  meeting_link: z.string().optional(),
  ticket_price: z.coerce.number().min(0),
  is_free: z.boolean(),
  convenience_fee: z.coerce.number().min(0).optional(),
  gateway_fee: z.coerce.number().min(0).optional(),
  capacity: z.coerce.number().int().min(1),
  registration_start: z.string().optional(),
  registration_end: z.string().optional(),
  start_datetime: z.string().min(1),
});
