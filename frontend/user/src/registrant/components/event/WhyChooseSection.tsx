import { ShieldCheck, Zap, CreditCard, MapPin } from 'lucide-react';
import Container from '@shared/components/common/Container';

const FEATURES = [
  {
    icon: MapPin,
    title: 'Discover nearby & online',
    description: 'Browse conferences, workshops, concerts, and meetups across cities or join from anywhere.',
  },
  {
    icon: Zap,
    title: 'Register in minutes',
    description: 'No account required. Pick your seats, apply a coupon, and confirm your spot quickly.',
  },
  {
    icon: CreditCard,
    title: 'Transparent pricing',
    description: 'See ticket price, fees, and discounts upfront before you complete registration.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted organizers',
    description: 'Every event is published by verified organizers on a platform built for reliability.',
  },
];

export default function WhyChooseSection() {
  return (
    <section className="bg-purple-100 py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl text-gray-900 sm:text-4xl">Why choose EventHub</h2>
          <p className="mt-3 text-muted">
            A modern platform designed for effortless event discovery and registration.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-xl bg-brand-50 p-3 text-brand-600">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
