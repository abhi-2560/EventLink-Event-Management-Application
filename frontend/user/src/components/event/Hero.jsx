import Container from '../common/Container';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 py-16 text-white sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
      <Container className="relative">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand-200">
          Discover · Register · Experience
        </p>
        <h1 className="max-w-3xl font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
          Find your next unforgettable event
        </h1>
        <p className="mt-4 max-w-xl text-lg text-brand-100">
          Browse conferences, workshops, concerts and more. Register in minutes — no account required.
        </p>
      </Container>
    </section>
  );
}
