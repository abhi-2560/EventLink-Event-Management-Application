import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@organizer/routes/ProtectedRoute';
import { renderWithProviders } from '@shared/test/test-utils';

test('redirects guests to organizer login', () => {
  renderWithProviders(
    <Routes>
      <Route path="/organizer/login" element={<p>Organizer login</p>} />
      <Route path="/organizer/dashboard" element={<ProtectedRoute><p>Dashboard</p></ProtectedRoute>} />
    </Routes>,
    { route: '/organizer/dashboard' },
  );

  expect(screen.getByText('Organizer login')).toBeInTheDocument();
});

test('renders protected content for authenticated organizers', () => {
  renderWithProviders(
    <Routes>
      <Route path="/organizer/dashboard" element={<ProtectedRoute><p>Dashboard</p></ProtectedRoute>} />
    </Routes>,
    { route: '/organizer/dashboard', token: 'organizer-token' },
  );

  expect(screen.getByText('Dashboard')).toBeInTheDocument();
});
