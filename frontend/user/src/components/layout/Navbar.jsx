import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import Container from '../common/Container';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50  bg-black backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <CalendarDays className="h-5 w-5" />
          </div>
          <span className="font-display text-2xl text-white">EventHub</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-white sm:flex">
          <Link to="/" className="transition-colors hover:text-brand-600">Events</Link>
          <Link to="/organizer/login" className="transition-colors hover:text-brand-600">Organizer</Link>
        </nav>
      </Container>
    </header>
  );
}
