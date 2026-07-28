import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import OrganizerRoutes from './OrganizerRoutes';
import Home from '../pages/public/Home';
import EventDetails from '../pages/public/EventDetails';
import Register from '../pages/registration/Register';
import Payment from '../pages/registration/Payment';
import Receipt from '../pages/registration/Receipt';
import NotFound from '../pages/error/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="events/:eventId" element={<EventDetails />} />
        <Route path="events/:eventId/register" element={<Register />} />
        <Route path="payment/:registrationId" element={<Payment />} />
        <Route path="receipt/:paymentId" element={<Receipt />} />
      </Route>
      <Route path="organizer/*" element={<OrganizerRoutes />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
