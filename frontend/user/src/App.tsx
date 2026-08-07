import { Toaster } from 'react-hot-toast';
import AppRoutes from '@shared/routes/AppRoutes';
import AppErrorBoundary from '@shared/components/common/AppErrorBoundary';
import ServerAvailabilityBanner from '@shared/components/common/ServerAvailabilityBanner';

export default function App() {
  return (
    <AppErrorBoundary>
      <ServerAvailabilityBanner />
      <AppRoutes />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </AppErrorBoundary>
  );
}
