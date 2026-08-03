import { ArrowRight } from 'lucide-react';
import Container from '../common/Container';
import Button from '../common/Button';

export default function HomeCta({ onBrowse }: { onBrowse: () => void }) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-black px-8 py-12 text-center text-white sm:px-12 sm:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.12),transparent_55%)]" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl">Ready to find your next event?</h2>
            <p className="mt-4 text-brand-100">
              Explore hundreds of experiences — from professional conferences to local workshops and live entertainment.
            </p>
            {/* <Button
              type="button"
              size="lg"
              className="mt-8 bg-white text-black hover:bg-brand-50"
              onClick={onBrowse}
            >
              Browse all events
              <ArrowRight className="h-4 w-4" />
            </Button> */}
              <button onClick={onBrowse} className='hover:bg-blue-600 hover:text-white px-6 py-3 text-base rounded-lg mt-8 bg-white text-black'>
                  Browse all events
              </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
