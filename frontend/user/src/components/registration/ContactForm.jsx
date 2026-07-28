import Input from '../common/Input';

export default function ContactForm({ register, errors }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Contact details</h3>
      <Input
        label="Full name *"
        placeholder="Your name"
        {...register('registrant_name')}
        error={errors.registrant_name?.message}
      />
      <Input
        label="Phone *"
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
