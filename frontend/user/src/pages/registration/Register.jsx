import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Container from '../../components/common/Container';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import ContactForm from '../../components/registration/ContactForm';
import ParticipantForm from '../../components/registration/ParticipantForm';
import RegistrationSummary from '../../components/registration/RegistrationSummary';
import Input from '../../components/common/Input';
import { getEvent } from '../../api/eventApi';
import { createRegistration } from '../../api/registrationApi';
import { validateCoupon } from '../../api/paymentApi';
import { useRegistration } from '../../context/RegistrationContext';
import { registrationSchema, buildRegistrationDefaults } from '../../schemas/registrationSchema';

export default function Register() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { setRegistration } = useRegistration();
  const [couponPreview, setCouponPreview] = useState(null);
  const [couponError, setCouponError] = useState('');

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId),
  });

  const methods = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: buildRegistrationDefaults(),
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = methods;
  const seats = watch('seats_booked');
  const couponCode = watch('coupon_code');

  useEffect(() => {
    setValue('seats_booked', Math.min(Math.max(seats, 1), event?.available_seats || 1));
  }, [seats, event?.available_seats, setValue]);

  const registrationMutation = useMutation({
    mutationFn: createRegistration,
    onSuccess: (data) => {
      setRegistration(data);
      navigate(`/payment/${data.registration_id}`);
    },
  });

  const onSubmit = (formData) => {
    if (formData.seats_booked > event.available_seats) {
      methods.setError('seats_booked', {
        message: `Only ${event.available_seats} seats available. Please reduce your booking.`,
      });
      return;
    }

    registrationMutation.mutate({
      event_id: eventId,
      registrant_name: formData.registrant_name,
      registrant_phone: formData.registrant_phone,
      registrant_email: formData.registrant_email || undefined,
      seats_booked: formData.seats_booked,
      coupon_code: formData.coupon_code || undefined,
    });
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponPreview(null);
    if (!couponCode?.trim()) {
      setCouponError('Enter a coupon code');
      return;
    }
    try {
      const result = await validateCoupon({
        coupon_code: couponCode.trim(),
        event_id: eventId,
        seat_count: seats,
      });
      setCouponPreview(result);
    } catch (err) {
      setCouponError(err.message);
    }
  };

  if (isLoading) {
    return (
      <Container className="py-16">
        <Loader message="Loading registration..." />
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <Link
        to={`/events/${eventId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to event
      </Link>

      <h1 className="font-display text-3xl text-gray-900">Register for {event.title}</h1>
      <p className="mt-2 text-muted">{event.available_seats} seats available</p>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <ContactForm register={register} errors={errors} />
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="mb-4">
                <Input
                  label="Number of seats"
                  type="number"
                  min={1}
                  max={event.available_seats}
                  {...register('seats_booked', { valueAsNumber: true })}
                  error={errors.seats_booked?.message}
                />
              </div>
              <ParticipantForm maxSeats={event.available_seats} />
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Coupon code</h3>
              <div className="mt-4 flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Enter coupon code"
                    {...register('coupon_code')}
                  />
                </div>
                <Button type="button" variant="secondary" onClick={handleApplyCoupon}>
                  Apply
                </Button>
              </div>
              {couponError && <p className="mt-2 text-xs text-danger">{couponError}</p>}
              {couponPreview && (
                <p className="mt-2 text-xs text-success">
                  Coupon applied: -{couponPreview.discount} off (final: {couponPreview.final_amount})
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <RegistrationSummary
              event={event}
              seats={seats}
              couponPreview={couponPreview}
              totalAmount={couponPreview?.final_amount}
            />

            {registrationMutation.isError && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {registrationMutation.error.message}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" loading={registrationMutation.isPending}>
              Proceed to Payment
            </Button>
          </div>
        </form>
      </FormProvider>
    </Container>
  );
}
