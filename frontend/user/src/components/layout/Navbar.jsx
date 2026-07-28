import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import Container from '../common/Container';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <CalendarDays className="h-5 w-5" />
          </div>
          <span className="font-display text-2xl text-brand-900">EventHub</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 sm:flex">
          <Link to="/" className="transition-colors hover:text-brand-600">Events</Link>
        </nav>
      </Container>
    </header>
  );
}
