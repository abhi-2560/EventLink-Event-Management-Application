import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@organizer/routes/ProtectedRoute';
import OrganizerLayout from '@organizer/layouts/OrganizerLayout';
import OrganizerLogin from '@organizer/pages/Login';
import OrganizerSignup from '@organizer/pages/Signup';
import OrganizerDashboard from '@organizer/pages/Dashboard';
import OrganizerEvents from '@organizer/pages/Events';
import CreateEvent from '@organizer/pages/CreateEvent';
import EditEvent from '@organizer/pages/EditEvent';
import OrganizerEventDetail from '@organizer/pages/EventDetail';
import OrganizerRegistrations from '@organizer/pages/Registrations';
import SalesReport from '@organizer/pages/SalesReport';
import OrganizerProfile from '@organizer/pages/Profile';
import { useAuth } from '@organizer/context/AuthContext';
import type { ReactNode } from 'react';

function LoginRedirect({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/organizer/dashboard" replace />;
  return children;
}

export default function OrganizerRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginRedirect><OrganizerLogin /></LoginRedirect>} />
      <Route path="signup" element={<LoginRedirect><OrganizerSignup /></LoginRedirect>} />
      <Route element={<ProtectedRoute><OrganizerLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OrganizerDashboard />} />
        <Route path="events" element={<OrganizerEvents />} />
        <Route path="events/new" element={<CreateEvent />} />
        <Route path="events/:eventId" element={<OrganizerEventDetail />} />
        <Route path="events/:eventId/edit" element={<EditEvent />} />
        <Route path="events/:eventId/registrations" element={<OrganizerRegistrations />} />
        <Route path="sales" element={<SalesReport />} />
        <Route path="profile" element={<OrganizerProfile />} />
      </Route>
    </Routes>
  );
}
