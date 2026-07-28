import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { loginAdmin } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../schemas/adminSchemas';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: ({ email, password }) => loginAdmin(email, password),
    onSuccess: (data) => { login(data.access_token); navigate('/dashboard'); },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-accent p-3 text-white"><Shield className="h-6 w-6" /></div>
          <div>
            <h1 className="text-xl font-bold">Admin Login</h1>
            <p className="text-sm text-muted">Platform administration</p>
          </div>
        </div>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
          {mutation.isError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{mutation.error.message}</p>}
          <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>Sign In</Button>
        </form>
      </div>
    </div>
  );
}
