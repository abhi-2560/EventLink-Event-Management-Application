import { CalendarDays, Users, Tag, Ticket } from 'lucide-react';
import type { Event } from '@shared/types/api';

export default function HomeStats({ events = [] }: { events?: Event[] }) {
  const totalEvents = events.length;
  const categories = new Set(events.map((e) => e.category_name).filter(Boolean)).size;
  const organizers = new Set(events.map((e) => e.organizer_name).filter(Boolean)).size;
  const openRegistration = events.filter((e) => e.registration_status === 'OPEN').length;

  const stats = [
    { label: 'Live Events', value: totalEvents, icon: CalendarDays },
    { label: 'Organizers', value: organizers, icon: Users },
    { label: 'Categories', value: categories, icon: Tag },
    { label: 'Open Registration', value: openRegistration, icon: Ticket },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="group rounded-2xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-muted">{label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
