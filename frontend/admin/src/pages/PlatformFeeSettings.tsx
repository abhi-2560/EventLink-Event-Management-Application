import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { getPlatformFees, updatePlatformFees } from '../api/adminApi';
import { showError, showSuccess } from '../utils/toast';

const feeSchema = z.object({
  convenience_fee: z.coerce.number().min(0, 'Must be 0 or more'),
  gateway_fee: z.coerce.number().min(0, 'Must be 0 or more'),
});

export default function PlatformFeeSettings() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-platform-fees'],
    queryFn: getPlatformFees,
  });

  const form = useForm({
    resolver: zodResolver(feeSchema),
    values: data ? {
      convenience_fee: Number(data.convenience_fee || 0),
      gateway_fee: Number(data.gateway_fee || 0),
    } : undefined,
  });

  const mutation = useMutation({
    mutationFn: updatePlatformFees,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-platform-fees'] });
      showSuccess('Platform fees updated');
    },
    onError: showError,
  });

  if (isLoading) return <Loader message="Loading platform fees..." />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Fee Settings</h1>
        <p className="text-sm text-muted">Manage global convenience and gateway fees applied to all paid registrations.</p>
      </div>

      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm"
      >
        <Input
          label="Convenience Fee (INR)"
          type="number"
          step="0.01"
          min={0}
          required
          {...form.register('convenience_fee', { valueAsNumber: true })}
          error={form.formState.errors.convenience_fee?.message}
        />
        <Input
          label="Gateway Fee (INR)"
          type="number"
          step="0.01"
          min={0}
          required
          {...form.register('gateway_fee', { valueAsNumber: true })}
          error={form.formState.errors.gateway_fee?.message}
        />
        <Button type="submit" loading={mutation.isPending}>Save Settings</Button>
      </form>
    </div>
  );
}
