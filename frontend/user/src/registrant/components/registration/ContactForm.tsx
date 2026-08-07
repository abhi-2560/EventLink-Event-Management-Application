import Input from '@shared/components/common/Input';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { RegistrationFormValues } from '@registrant/schemas/registrationSchema';

export default function ContactForm({ register, errors }: {
  register: UseFormRegister<RegistrationFormValues>;
  errors: FieldErrors<RegistrationFormValues>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Contact details</h3>
      <Input
        label="Full name"
        required
        placeholder="Your name"
        {...register('registrant_name')}
        error={errors.registrant_name?.message}
      />
      <Input
        label="Phone"
        required
        type="tel"
        placeholder="10-digit mobile number"
        {...register('registrant_phone')}
        error={errors.registrant_phone?.message}
      />
      <Input
        label="Email (optional)"
        type="email"
        placeholder="you@example.com"
        {...register('registrant_email')}
        error={errors.registrant_email?.message}
      />
    </div>
  );
}
