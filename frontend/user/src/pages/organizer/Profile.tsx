import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { getProfile, updateProfile, changePassword } from '../../api/organizerApi';
import { profileSchema, passwordSchema } from '../../schemas/organizerSchemas';
import type { PasswordFormValues, ProfileFormValues } from '../../schemas/organizerSchemas';

export default function OrganizerProfile() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['organizer-profile'],
    queryFn: getProfile,
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      organizer_name: profile.organizer_name,
      contact_person: profile.contact_person ?? '',
      phone: profile.phone ?? '',
    } : undefined,
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  });

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizer-profile'] }),
  });

  const passwordMutation = useMutation({
    mutationFn: ({ current_password, new_password }: PasswordFormValues) => changePassword(current_password, new_password),
    onSuccess: () => passwordForm.reset(),
  });

  if (isLoading) return <Loader message="Loading profile..." />;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-gray-900">Profile</h1>
        <p className="mt-1 text-muted">Manage your organizer account</p>
      </div>

      <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))} className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Organization details</h2>
        <Input label="Organization name" {...profileForm.register('organizer_name')} error={profileForm.formState.errors.organizer_name?.message} />
        <Input label="Contact person" {...profileForm.register('contact_person')} error={profileForm.formState.errors.contact_person?.message} />
        <Input label="Phone" {...profileForm.register('phone')} error={profileForm.formState.errors.phone?.message} />
        <Input label="Email" value={profile?.email || ''} disabled />
        {profileMutation.isError && <p className="text-sm text-danger">{profileMutation.error.message}</p>}
        {profileMutation.isSuccess && <p className="text-sm text-success">Profile updated.</p>}
        <Button type="submit" loading={profileMutation.isPending}>Save Profile</Button>
      </form>

      <form onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate(d))} className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Change password</h2>
        <Input label="Current password" type="password" {...passwordForm.register('current_password')} error={passwordForm.formState.errors.current_password?.message} />
        <Input label="New password" type="password" {...passwordForm.register('new_password')} error={passwordForm.formState.errors.new_password?.message} />
        <Input label="Confirm password" type="password" {...passwordForm.register('confirm_password')} error={passwordForm.formState.errors.confirm_password?.message} />
        {passwordMutation.isError && <p className="text-sm text-danger">{passwordMutation.error.message}</p>}
        {passwordMutation.isSuccess && <p className="text-sm text-success">Password updated.</p>}
        <Button type="submit" variant="secondary" loading={passwordMutation.isPending}>Update Password</Button>
      </form>
    </div>
  );
}
