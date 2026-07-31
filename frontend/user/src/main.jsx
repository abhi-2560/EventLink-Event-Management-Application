import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { RegistrationProvider } from './context/RegistrationContext';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import AppErrorBoundary from './components/common/AppErrorBoundary';
import ServerAvailabilityBanner from './components/common/ServerAvailabilityBanner';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <RegistrationProvider>
            <AppErrorBoundary>
              <ServerAvailabilityBanner />
              <AppRoutes />
              <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            </AppErrorBoundary>
          </RegistrationProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
