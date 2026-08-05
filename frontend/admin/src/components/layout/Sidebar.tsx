import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays, Tags, Ticket, BarChart3, ScrollText, User, LogOut, Menu, X, Shield, IndianRupee,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { logoutAdmin } from '../../api/adminApi';
import { showSuccess } from '../../utils/toast';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/organizers', label: 'Organizers', icon: Users },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/coupons', label: 'Coupons', icon: Ticket },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings/platform-fees', label: 'Platform Fees', icon: IndianRupee },
  { to: '/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logoutAdmin(); } catch { /* ignore */ }
    logout();
    showSuccess('Signed out successfully');
    navigate('/login');
  };

  const nav = (
    <nav className="flex flex-col gap-0.5 p-3">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} onClick={() => setOpen(false)}
          className={({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isActive ? 'bg-accent text-white' : 'text-slate-300 hover:bg-sidebar-hover hover:text-white')}>
          <Icon className="h-4 w-4" />{label}
        </NavLink>
      ))}
      <button type="button" onClick={handleLogout}
        className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-sidebar-hover hover:text-red-400">
        <LogOut className="h-4 w-4" />Logout
      </button>
    </nav>
  );

  return (
    <>
      <button type="button" className="fixed left-4 top-4 z-40 rounded-lg bg-sidebar p-2 text-white lg:hidden" onClick={() => setOpen(!open)}>
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <aside className={cn('fixed inset-y-0 left-0 z-30 w-60 bg-sidebar text-white transition-transform lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex h-16 items-center gap-2 px-5">
          <Shield className="h-6 w-6 text-accent" />
          <span onClick={()=>navigate('/')} className="font-semibold text-2xl">Admin</span>
        </div>
        {nav}
      </aside>
      {open && <button type="button" className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-label="Close" />}
    </>
  );
}
