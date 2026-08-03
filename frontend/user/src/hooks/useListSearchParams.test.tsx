import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useDateRangeParams, useListSearchParams } from './useListSearchParams';
import type { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={['/?page=2&q=music']}>{children}</MemoryRouter>;
const schema = { page: { type: 'number' as const, default: 1 }, query: { param: 'q', default: '' } };

test('reads and persists list values in URL search parameters', () => {
  const { result } = renderHook(() => useListSearchParams(schema), { wrapper });

  expect(result.current).toMatchObject({ page: 2, query: 'music' });
  act(() => result.current.setParam('page', 1));
  expect(result.current.page).toBe(1);
});

test('persists functional date range updates in URL state', () => {
  const { result } = renderHook(
    () => useDateRangeParams({ start: '2025-01-01', end: '2025-06-30' }),
    { wrapper },
  );

  act(() => result.current.setRange((range) => ({ ...range, end: '2025-05-31' })));

  expect(result.current.range).toEqual({ start: '2025-01-01', end: '2025-05-31' });
});
