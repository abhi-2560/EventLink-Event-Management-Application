import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useListSearchParams } from './useListSearchParams';

const wrapper = ({ children }) => <MemoryRouter initialEntries={['/?page=2&q=music']}>{children}</MemoryRouter>;
const schema = { page: { type: 'number', default: 1 }, query: { param: 'q', default: '' } };

test('reads and persists list values in URL search parameters', () => {
  const { result } = renderHook(() => useListSearchParams(schema), { wrapper });

  expect(result.current).toMatchObject({ page: 2, query: 'music' });
  act(() => result.current.setParam('page', 1));
  expect(result.current.page).toBe(1);
});
