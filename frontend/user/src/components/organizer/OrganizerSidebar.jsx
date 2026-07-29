import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, PlusCircle, TrendingUp, User, LogOut, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { logoutOrganizer } from '../../api/authApi';
import { showSuccess } from '../../utils/toast';

const links = [
  { to: '/organizer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/organizer/events', label: 'My Events', icon: CalendarDays },
  { to: '/organizer/events/new', label: 'Create Event', icon: PlusCircle },
  { to: '/organizer/sales', label: 'Period Report', icon: TrendingUp },
  { to: '/organizer/profile', label: 'Profile', icon: User },
];

export default function OrganizerSidebar() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logoutOrganizer(); } catch { /* ignore */ }
    logout();
    showSuccess('Signed out successfully');
    navigate('/organizer/login');
  };

  const nav = (
    <nav className="flex flex-col gap-1 p-4">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/organizer/events'}
          onClick={() => setOpen(false)}
          className={({ isActive }) => cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            isActive ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700',
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-danger"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </nav>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-40 rounded-lg border border-border bg-white p-2 lg:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 w-64 border-r border-border bg-white transition-transform lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="font-display text-2xl text-brand-900">Organizer</span>
        </div>
        {nav}
      </aside>
      {open && <button type="button" className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu" />}
    </>
  );
}
