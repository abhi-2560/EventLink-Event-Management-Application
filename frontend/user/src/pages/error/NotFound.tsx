import { Link } from 'react-router-dom';
import Container from '../../components/common/Container';
import Button from '../../components/common/Button';

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-display text-6xl text-brand-200">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">Page not found</h1>
      <p className="mt-2 text-muted">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-6">
        <Button>Go home</Button>
      </Link>
    </Container>
  );
}
