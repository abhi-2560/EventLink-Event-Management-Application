import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { getProfile, updateProfile, changePassword } from '../api/adminApi';
import { profileSchema, passwordSchema } from '../schemas/adminSchemas';
import type { PasswordPayload } from '../types/admin';

export default function Profile() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-profile'], queryFn: getProfile });

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    values: data ? { name: data.name } : undefined,
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  });

  const profileMut = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-profile'] }),
  });

  const passwordMut = useMutation({
    mutationFn: ({ current_password, new_password }: PasswordPayload) => changePassword(current_password, new_password),
    onSuccess: () => passwordForm.reset(),
  });

  if (isLoading) return <Loader />;

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <h1 className="text-2xl font-bold">Profile</h1>

      <form onSubmit={profileForm.handleSubmit((d) => profileMut.mutate(d))} className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Account</h2>
        <Input label="Name" {...profileForm.register('name')} error={profileForm.formState.errors.name?.message} />
        <Input label="Email" value={data?.email || ''} disabled />
        {profileMut.isSuccess && <p className="text-sm text-success">Profile updated.</p>}
        {profileMut.isError && <p className="text-sm text-danger">{profileMut.error.message}</p>}
        <Button type="submit" loading={profileMut.isPending}>Save</Button>
      </form>

      <form onSubmit={passwordForm.handleSubmit((d) => passwordMut.mutate(d))} className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Change Password</h2>
        <Input label="Current Password" type="password" {...passwordForm.register('current_password')} error={passwordForm.formState.errors.current_password?.message} />
        <Input label="New Password" type="password" {...passwordForm.register('new_password')} error={passwordForm.formState.errors.new_password?.message} />
        <Input label="Confirm Password" type="password" {...passwordForm.register('confirm_password')} error={passwordForm.formState.errors.confirm_password?.message} />
        {passwordMut.isSuccess && <p className="text-sm text-success">Password updated.</p>}
        {passwordMut.isError && <p className="text-sm text-danger">{passwordMut.error.message}</p>}
        <Button type="submit" variant="secondary" loading={passwordMut.isPending}>Update Password</Button>
      </form>
    </div>
  );
}
