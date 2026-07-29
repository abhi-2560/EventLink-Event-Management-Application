import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Organizers from '../pages/Organizers';
import OrganizerDetail from '../pages/OrganizerDetail';
import Events from '../pages/Events';
import EventDetail from '../pages/EventDetail';
import EditEvent from '../pages/EditEvent';
import Categories from '../pages/Categories';
import Reports from '../pages/Reports';
import AuditLogs from '../pages/AuditLogs';
import AuditLogDetail from '../pages/AuditLogDetail';
import Coupons from '../pages/Coupons';
import PlatformFeeSettings from '../pages/PlatformFeeSettings';
import Profile from '../pages/Profile';

function Protected({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function Guest({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Guest><Login /></Guest>} />
      <Route element={<Protected><AdminLayout /></Protected>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/organizers" element={<Organizers />} />
        <Route path="/organizers/:organizerId" element={<OrganizerDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route path="/events/:eventId/edit" element={<EditEvent />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings/platform-fees" element={<PlatformFeeSettings />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/audit-logs/:logId" element={<AuditLogDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
