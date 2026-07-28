import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { loginOrganizer } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

export default function OrganizerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/organizer/dashboard';

  const mutation = useMutation({
    mutationFn: () => loginOrganizer(email, password),
    onSuccess: (data) => {
      login(data.access_token);
      navigate(from, { replace: true });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-brand-600 p-3 text-white">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-gray-900">Organizer Login</h1>
            <p className="text-sm text-muted">Manage your events and registrations</p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {mutation.isError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{mutation.error.message}</p>
          )}
          <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>Sign In</Button>
        </form>
      </div>
    </div>
  );
}
