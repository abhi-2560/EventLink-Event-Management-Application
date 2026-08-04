import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { GuestRoute, ProtectedRoute } from './RouteGuards';
import { renderWithProviders } from '../test/test-utils';

test('redirects an unauthenticated admin to login', () => {
  renderWithProviders(
    <Routes>
      <Route path="/login" element={<p>Login</p>} />
      <Route path="/dashboard" element={<ProtectedRoute><p>Dashboard</p></ProtectedRoute>} />
    </Routes>,
    { route: '/dashboard' },
  );

  expect(screen.getByText('Login')).toBeInTheDocument();
});

test('renders protected admin routes when authenticated', () => {
  renderWithProviders(
    <Routes>
      <Route path="/dashboard" element={<ProtectedRoute><p>Dashboard</p></ProtectedRoute>} />
    </Routes>,
    { route: '/dashboard', token: 'admin-token' },
  );

  expect(screen.getByText('Dashboard')).toBeInTheDocument();
});

test('redirects authenticated admins away from the login page', () => {
  renderWithProviders(
    <Routes>
      <Route path="/login" element={<GuestRoute><p>Login</p></GuestRoute>} />
      <Route path="/dashboard" element={<p>Dashboard</p>} />
    </Routes>,
    { route: '/login', token: 'admin-token' },
  );

  expect(screen.getByText('Dashboard')).toBeInTheDocument();
});
