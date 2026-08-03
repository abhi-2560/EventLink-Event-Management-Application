import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ServerUnavailable from './ServerUnavailable';
import { renderWithProviders } from '../../test/test-utils';

test('shows a friendly unavailable-server fallback and retries', async () => {
  const retry = jest.fn();
  renderWithProviders(<ServerUnavailable onRetry={retry} />);

  expect(screen.getByText('Our servers are temporarily unavailable.')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(retry).toHaveBeenCalledTimes(1);
});
