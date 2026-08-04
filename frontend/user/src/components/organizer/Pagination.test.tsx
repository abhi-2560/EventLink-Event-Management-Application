import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination, { paginate } from './Pagination';

test('paginate slices items and clamps page numbers', () => {
  const result = paginate([1, 2, 3, 4, 5], 99, 2);
  expect(result).toEqual({ items: [5], page: 3, totalPages: 3, total: 5 });
});

test('pagination controls change pages and disable at boundaries', async () => {
  const onPageChange = jest.fn();
  render(<Pagination page={2} totalPages={3} onPageChange={onPageChange} />);

  expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /Next/i }));
  expect(onPageChange).toHaveBeenCalledWith(3);

  await userEvent.click(screen.getByRole('button', { name: /Prev/i }));
  expect(onPageChange).toHaveBeenCalledWith(1);
});

test('renders nothing for a single page', () => {
  const { container } = render(<Pagination page={1} totalPages={1} onPageChange={jest.fn()} />);
  expect(container).toBeEmptyDOMElement();
});
