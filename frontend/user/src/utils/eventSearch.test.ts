import { buildEventSearchFilters, hasActiveEventFilters } from './eventSearch';

test('buildEventSearchFilters trims values and omits empty fields', () => {
  expect(buildEventSearchFilters({ title: '  music ', city: '', type: 'ONLINE' })).toEqual({
    title: 'music',
    type: 'ONLINE',
  });
});

test('buildEventSearchFilters returns null when no filters are active', () => {
  expect(buildEventSearchFilters({ title: '   ', city: '' })).toBeNull();
  expect(hasActiveEventFilters(null)).toBe(false);
});

test('hasActiveEventFilters detects active filters', () => {
  expect(hasActiveEventFilters({ city: 'Indore' })).toBe(true);
});
