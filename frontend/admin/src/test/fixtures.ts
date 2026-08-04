export const mockCategory = {
  category_id: 'cat-1',
  name: 'Conference',
  description: 'Conference events',
  is_default: true,
  total_events: 2,
};

export const mockCoupon = {
  coupon_id: 'coupon-1',
  code: 'SAVE10',
  description: 'Ten off',
  flat_discount: '10.00',
  is_active: true,
  times_used: 1,
};

export const mockOrganizer = {
  organizer_id: 'org-1',
  organizer_name: 'Test Organizer',
  contact_person: 'Test Contact',
  email: 'organizer@test.local',
  phone: '9876543210',
  status: 'ACTIVE',
  total_events: 2,
  total_sales: '500.00',
};

export const mockAuditLog = {
  log_id: 'log-1',
  action: 'Coupon Created',
  created_at: '2026-08-01T10:00:00Z',
  actor_name: 'Admin User',
  actor_type: 'ADMIN',
  entity_name: 'SAVE10',
  entity_type: 'coupon',
};

export const mockEvent = {
  event_id: 'event-1',
  title: 'Indore Tech Summit',
  category_name: 'Conference',
  organizer_name: 'Test Organizer',
  city: 'Indore',
  start_datetime: '2026-09-01T10:00:00Z',
  available_seats: 50,
  capacity: 100,
  status: 'PUBLISHED',
};
