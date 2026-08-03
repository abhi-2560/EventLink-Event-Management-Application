export type Id = string | number;

export type Category = {
  category_id: Id;
  name: string;
  description?: string | null;
  is_default?: boolean;
  total_events?: number;
};
export type CategoryPayload = Pick<Category, 'name'> & Pick<Category, 'description' | 'is_default'>;

export type Coupon = {
  coupon_id: Id;
  code: string;
  description?: string | null;
  flat_discount: string | number;
  expiry_date?: string | null;
  is_active: boolean;
  times_used?: number;
  total_discount_given?: string | number;
};
export type CouponPayload = {
  code: string; description?: string; flat_discount: number; expiry_date?: string; is_active: boolean;
};

export type Event = {
  event_id: Id; title: string; description?: string | null; event_type: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  venue?: string | null; city?: string | null; state?: string | null; country?: string | null; meeting_link?: string | null;
  ticket_price: string | number; is_free: boolean; capacity: number; registration_start?: string | null; registration_end?: string | null;
  start_datetime: string; status?: string; registration_status?: string; organizer_name?: string; category_name?: string; available_seats?: number;
  total_sales?: string | number; total_registrations?: number; total_tickets_sold?: number;
};
export type EventPayload = Omit<Event, 'event_id' | 'status' | 'organizer_name' | 'category_name' | 'available_seats'>;

export type Organizer = {
  organizer_id: Id; organizer_name: string; contact_person: string; email: string; phone: string; status: string;
  total_events?: number; total_registrations?: number; total_sales?: string | number; created_at?: string;
};
export type OrganizerPayload = Pick<Organizer, 'organizer_name' | 'contact_person' | 'email' | 'phone'>;

export type LoginPayload = { email: string; password: string };
export type LoginResponse = { access_token: string };
export type DateParams = { start_date: string; end_date: string };
export type ProfilePayload = { name: string };
export type PasswordPayload = { current_password: string; new_password: string; confirm_password?: string };
export type AuditLog = {
  log_id: Id; action: string; created_at: string; actor_name?: string | null; actor_type: string;
  entity_name?: string | null; entity_type: string; old_value?: unknown; new_value?: unknown;
};
export type PaginatedAuditLogs = { items: AuditLog[]; page: number; total_pages: number; total: number };
