import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useDateRangeParams } from './useListSearchParams';

const wrapper = ({ children }) => <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>;

test('persists functional date range updates in URL state', () => {
  const { result } = renderHook(
    () => useDateRangeParams({ start: '2025-01-01', end: '2025-06-30' }),
    { wrapper },
  );

  act(() => result.current.setRange((range) => ({ ...range, start: '2025-02-01' })));

  expect(result.current.range).toEqual({ start: '2025-02-01', end: '2025-06-30' });
});
