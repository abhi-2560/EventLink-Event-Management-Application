export interface Pagination {
  count: number;
  next: string | null;
  previous: string | null;
}

export interface ApiList<T> extends Pagination {
  results: T[];
}

export interface ApiError {
  message?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

export interface EventMedia {
  id: string;
  file: string;
  media_id: string;
  media_url: string;
  caption?: string;
  is_cover?: boolean;
}

export interface Event {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  category_id?: string;
  category?: string;
  event_type: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  venue?: string;
  city?: string;
  state?: string;
  country?: string;
  meeting_link?: string;
  keywords?: string[];
  ticket_price: string;
  is_free: boolean;
  capacity: number;
  registration_start?: string;
  registration_end?: string;
  start_datetime: string;
  registration_status?: 'OPEN' | 'CLOSED';
  media?: EventMedia[];
  banner_url?: string;
  category_name?: string;
  organizer_name?: string;
  available_seats: number;
  convenience_fee?: string;
  gateway_fee?: string;
  images?: EventMedia[];
  videos?: EventMedia[];
  status?: 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'ARCHIVED';
  total_registrations?: number;
  total_sales?: string | number;
}

export interface Registration {
  id: string;
  event?: Event;
  registrant_name: string;
  registrant_phone: string;
  registrant_email?: string;
  seats_booked: number;
  amount_paid?: string;
  status?: string;
  registration_id?: string;
  event_id?: string;
  registration_status?: string;
  payment_status?: string;
  total_amount?: string | number;
  receipt_available?: boolean;
  receipt_number?: string;
  order_id?: string;
  payment_id?: string;
  reservation_expires_at?: string;
}

export interface Payment {
  id: string;
  registration?: Registration;
  amount: string;
  status: string;
  receipt_url?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token?: string;
  organizer?: Organizer;
}

export interface Organizer {
  id: string;
  organizer_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
}

export interface Category {
  id: string;
  category_id: string;
  name: string;
}

export interface CouponValidation {
  discount: string | number;
  final_amount: string | number;
}

export interface PaymentReceipt {
  receipt_number: string;
  event_title: string;
  category_name?: string;
  event_type: Event['event_type'];
  venue?: string;
  city?: string;
  state?: string;
  meeting_link?: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email?: string;
  ticket_price?: string | number;
  discount?: string | number;
  convenience_fee?: string | number;
  gateway_fee?: string | number;
  amount: string | number;
  payment_id: string;
  order_id: string;
  payment_status: string;
  completed_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type?: string;
  discount_value?: string;
}
