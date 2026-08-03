import { Search, Sparkles, Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from '../common/Container';
import Button from '../common/Button';
import type { FormEvent } from 'react';

interface HeroProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: () => void;
}

export default function Hero({ searchValue, onSearchChange, onSearchSubmit }: HeroProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearchSubmit?.();
  };

  return (
    <section className="relative overflow-hidden bg-black pb-28 pt-16 text-white sm:pb-32 sm:pt-20 lg:pb-36">
      {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.14),transparent_55%)]" />
      <div className="absolute -right-20 top-10 hidden h-72 w-72 rounded-full bg-brand-400/20 blur-3xl lg:block" />
      <div className="absolute -left-16 bottom-0 hidden h-64 w-64 rounded-full bg-accent-400/10 blur-3xl lg:block" /> */}

      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-brand-100 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-accent-400" />
              Discover · Register · Experience
            </p>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Find your next unforgettable event
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-100">
              Browse conferences, workshops, concerts and more across India. Register in minutes — no account required.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#browse-events">
                <Button type="button" variant="secondary" className="text-brand-100 hover:bg-white/10 hover:text-white hover:border-purple-600">
                  Explore Events
                </Button>
              </a>
              <Link to="/organizer/signup">
                <Button type="button" variant="secondary" className="text-brand-100 hover:bg-white/10 hover:text-white hover:border-purple-600">
                  List your event
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative hidden animate-in fade-in slide-in-from-right-4 duration-700 delay-150 lg:block">
            <div className="relative mx-auto aspect-square max-w-md">
              <div className="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur-sm" />
              <div className="absolute inset-4 rounded-2xl border border-white/20 bg-gradient-to-br from-white/15 to-transparent p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl bg-white/20 p-4 backdrop-blur-sm">
                    <Calendar className="h-8 w-8 text-accent-400" />
                    <div>
                      <p className="font-semibold">Tech Conference 2026</p>
                      <p className="text-sm text-brand-100">Aug 15 · Mumbai</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                    <MapPin className="h-8 w-8 text-brand-200" />
                    <div>
                      <p className="font-semibold">Design Workshop</p>
                      <p className="text-sm text-brand-100">Sep 2 · Bangalore</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                    <Sparkles className="h-8 w-8 text-brand-200" />
                    <div>
                      <p className="font-semibold">Live Concert Night</p>
                      <p className="text-sm text-brand-100">Sep 20 · Delhi</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
