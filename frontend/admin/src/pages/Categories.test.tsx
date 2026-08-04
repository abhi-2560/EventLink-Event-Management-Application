import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Categories from './Categories';
import { archiveCategory, createCategory, getCategories } from '../api/adminApi';
import { mockCategory } from '../test/fixtures';
import { renderWithProviders } from '../test/test-utils';
import { showSuccess } from '../utils/toast';

jest.mock('../api/adminApi', () => ({
  getCategories: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  archiveCategory: jest.fn(),
}));

jest.mock('../utils/toast', () => ({
  showError: jest.fn(),
  showSuccess: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getCategories).mockResolvedValue([mockCategory]);
});

test('renders categories and opens create form', async () => {
  renderWithProviders(<Categories />, { token: 'admin-token' });

  expect(await screen.findByText('Conference')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /Create Category/i }));

  expect(screen.getByText('New Category')).toBeInTheDocument();
});

test('creates a category and refreshes the list', async () => {
  jest.mocked(createCategory).mockResolvedValue({ ...mockCategory, category_id: 'cat-2', name: 'Workshop' });

  renderWithProviders(<Categories />, { token: 'admin-token' });
  await screen.findByText('Conference');
  await userEvent.click(screen.getByRole('button', { name: /Create Category/i }));

  await userEvent.type(screen.getByLabelText(/^Name/i), 'Workshop');
  await userEvent.click(screen.getByRole('button', { name: 'Create' }));

  await waitFor(() => {
    expect(jest.mocked(createCategory).mock.calls[0][0]).toEqual(
      expect.objectContaining({ name: 'Workshop' }),
    );
  });
  expect(showSuccess).toHaveBeenCalledWith('Category created');
  await waitFor(() => {
    expect(getCategories).toHaveBeenCalledTimes(2);
  });
});

test('shows category loading errors', async () => {
  jest.mocked(getCategories).mockRejectedValue(new Error('Failed to load categories'));
  renderWithProviders(<Categories />, { token: 'admin-token' });

  expect(await screen.findByText('Failed to load categories')).toBeInTheDocument();
});
