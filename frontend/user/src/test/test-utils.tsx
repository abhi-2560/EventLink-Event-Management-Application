import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { RegistrationProvider } from '../context/RegistrationContext';
import type { ReactElement } from 'react';

export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    queryClient = createTestQueryClient(),
    token,
  }: { route?: string; queryClient?: QueryClient; token?: string } = {},
) {
  if (token !== undefined) {
    if (token) localStorage.setItem('organizer_token', token);
    else localStorage.removeItem('organizer_token');
  }

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <AuthProvider>
            <RegistrationProvider>{ui}</RegistrationProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  };
}
