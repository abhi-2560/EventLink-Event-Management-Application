import Container from '@shared/components/common/Container';
import { CalendarDays, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-black text-brand-100 ">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                <CalendarDays className="h-5 w-5" />
              </div>
              <span className="font-display text-2xl text-white">EventHub</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white">
              Discover and register for events across India — conferences, workshops, concerts, and local meetups.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white">Explore</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white">Browse Events</Link></li>
              <li><Link to="/organizer/login" className="hover:text-white">Organizer Login</Link></li>
              <li><Link to="/organizer/signup" className="hover:text-white">List an Event</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Contact</h4>
            <p className="mt-4 flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              support@eventhub.in
            </p>
          </div>
        </div>
        <div className="mt-10 border-t border-white pt-6 text-center text-sm text-white">
          © {new Date().getFullYear()} EventHub. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
