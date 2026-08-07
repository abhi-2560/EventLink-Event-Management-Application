import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CalendarDays, HomeIcon } from 'lucide-react';
import Input from '@shared/components/common/Input';
import Button from '@shared/components/common/Button';
import { registerOrganizer } from '@organizer/api/authApi';
import { signupSchema } from '@organizer/schemas/organizerSchemas';
import { showError, showSuccess } from '@shared/utils/toast';
import type { SignupFormValues } from '@organizer/schemas/organizerSchemas';

export default function OrganizerSignup() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      organizer_name: '',
      contact_person: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: SignupFormValues) => registerOrganizer({
      organizer_name: data.organizer_name,
      contact_person: data.contact_person,
      email: data.email,
      phone: data.phone,
      password: data.password,
    }),
    onSuccess: () => {
      showSuccess('Account created successfully');
      navigate('/organizer/login', { state: { registered: true }, replace: true });
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
        <HomeIcon className='w-4 h-4' />
        Home
      </button>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-brand-600 p-3 text-white">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-gray-900">Create Account</h1>
            <p className="text-sm text-muted">Register as an event organizer</p>
          </div>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <Input
            label="Organizer Name"
            required
            {...register('organizer_name')}
            error={errors.organizer_name?.message}
            autoComplete="organization"
          />
          <Input
            label="Contact Person"
            required
            {...register('contact_person')}
            error={errors.contact_person?.message}
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            required
            {...register('email')}
            error={errors.email?.message}
            autoComplete="email"
          />
          <Input
            label="Phone Number"
            type="tel"
            required
            {...register('phone')}
            error={errors.phone?.message}
            autoComplete="tel"
          />
          <Input
            label="Password"
            type="password"
            required
            {...register('password')}
            error={errors.password?.message}
            autoComplete="new-password"
          />
          <Input
            label="Confirm Password"
            type="password"
            required
            {...register('confirm_password')}
            error={errors.confirm_password?.message}
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/organizer/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
