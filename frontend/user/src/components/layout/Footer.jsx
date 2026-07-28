import Container from '../common/Container';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-white py-10">
      <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="font-display text-xl text-brand-900">EventHub</p>
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} EventHub. Discover events near you.
        </p>
      </Container>
    </footer>
  );
}
