import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './RouteGuards';
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
