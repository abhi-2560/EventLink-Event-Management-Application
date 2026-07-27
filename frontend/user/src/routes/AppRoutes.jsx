import { Routes, Route } from "react-router-dom";

import PublicLayout from "@/layouts/PublicLayout";

import Home from "@/pages/public/Home";
import Events from "@/pages/public/Event";
import EventDetails from "@/pages/public/EventDetails";
import Register from "@/pages/registration/Register"
import Payment from "@/pages/registration/Payment";
import Receipt from "@/pages/registration/Receipt";
import NotFound from "@/pages/error/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/register/:id" element={<Register />} />
        <Route
          path="/payment/:registrationId"
          element={<Payment />}
        />
        <Route
          path="/receipt/:paymentId"
          element={<Receipt />}
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}