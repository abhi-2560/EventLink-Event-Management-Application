import { Routes, Route } from 'react-router-dom';
import PublicLayout from '@registrant/layouts/PublicLayout';
import OrganizerRoutes from '@organizer/routes/OrganizerRoutes';
import Home from '@registrant/pages/public/Home';
import EventDetails from '@registrant/pages/public/EventDetails';
import Register from '@registrant/pages/registration/Register';
import Payment from '@registrant/pages/registration/Payment';
import Receipt from '@registrant/pages/registration/Receipt';
import NotFound from '@shared/pages/error/NotFound';

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
