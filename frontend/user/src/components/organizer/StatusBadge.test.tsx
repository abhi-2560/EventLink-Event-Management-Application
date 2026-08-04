import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

test('renders known status labels', () => {
  render(<StatusBadge status="PUBLISHED" />);
  expect(screen.getByText('PUBLISHED')).toBeInTheDocument();
});

test('renders nothing when status is missing', () => {
  const { container } = render(<StatusBadge />);
  expect(container).toBeEmptyDOMElement();
});
