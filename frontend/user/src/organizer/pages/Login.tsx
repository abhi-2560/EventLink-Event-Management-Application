import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { CalendarDays, HomeIcon } from 'lucide-react';
import Input from '@shared/components/common/Input';
import Button from '@shared/components/common/Button';
import { loginOrganizer } from '@organizer/api/authApi';
import { useAuth } from '@organizer/context/AuthContext';
import { showError, showSuccess } from '@shared/utils/toast';

export default function OrganizerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/organizer/dashboard';
  const registered = location.state?.registered;

  const mutation = useMutation({
    mutationFn: () => loginOrganizer(email, password),
    onSuccess: (data) => {
      login(data.access_token);
      showSuccess('Signed in successfully');
      navigate(from, { replace: true });
    },
    onError: showError,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-200 p-4">
      <button
        type="button"
        className="absolute right-4 top-4 flex items-center gap-2 rounded-lg px-4 py-2 text-xl font-medium text-gray-800 hover:bg-brand-600 hover:text-white  transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg"
        onClick={() => navigate('/')}
      >
        <HomeIcon className='w-4 h-4'/>
        Home
      </button>
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

        {registered && (
          <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Account created successfully. Please sign in with your credentials.
          </p>
        )}

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>Sign In</Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          New organizer?{' '}
          <Link to="/organizer/signup" className="font-medium text-brand-600 hover:text-brand-700">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
