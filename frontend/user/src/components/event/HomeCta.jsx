import { ArrowRight } from 'lucide-react';
import Container from '../common/Container';
import Button from '../common/Button';

export default function HomeCta({ onBrowse }) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 px-8 py-12 text-center text-white sm:px-12 sm:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.12),transparent_55%)]" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl">Ready to find your next event?</h2>
            <p className="mt-4 text-brand-100">
              Explore hundreds of experiences — from professional conferences to local workshops and live entertainment.
            </p>
            <Button
              type="button"
              size="lg"
              className="mt-8 bg-blue-800 hover:bg-brand-50"
              onClick={onBrowse}
            >
              Browse all events
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
