import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import OrganizerLayout from '../layouts/OrganizerLayout';
import OrganizerLogin from '../pages/organizer/Login';
import OrganizerSignup from '../pages/organizer/Signup';
import OrganizerDashboard from '../pages/organizer/Dashboard';
import OrganizerEvents from '../pages/organizer/Events';
import CreateEvent from '../pages/organizer/CreateEvent';
import EditEvent from '../pages/organizer/EditEvent';
import OrganizerEventDetail from '../pages/organizer/EventDetail';
import OrganizerRegistrations from '../pages/organizer/Registrations';
import SalesReport from '../pages/organizer/SalesReport';
import OrganizerProfile from '../pages/organizer/Profile';
import { useAuth } from '../context/AuthContext';

function LoginRedirect({ children }) {
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
