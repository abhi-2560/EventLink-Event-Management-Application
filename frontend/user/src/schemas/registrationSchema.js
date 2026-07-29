import { z } from 'zod';

export const registrationSchema = z.object({
  registrant_name: z.string().min(2, 'Name must be at least 2 characters'),
  registrant_phone: z
    .string()
    .min(10, 'Enter a valid phone number')
    .max(15, 'Phone number is too long')
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number'),
  registrant_email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  seats_booked: z.coerce.number().int().min(1, 'Book at least 1 seat'),
  coupon_code: z.string().optional(),
});

export function buildRegistrationDefaults(availableSeats = 1) {
  return {
    registrant_name: '',
    registrant_phone: '',
    registrant_email: '',
    seats_booked: Math.min(1, availableSeats),
    coupon_code: '',
  };
}
