import { act, renderHook } from '@testing-library/react';
import useDebounce from './useDebounce';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('debounces value updates', () => {
  const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
    initialProps: { value: 'first' },
  });

  rerender({ value: 'second' });
  expect(result.current).toBe('first');

  act(() => {
    jest.advanceTimersByTime(500);
  });

  expect(result.current).toBe('second');
});
