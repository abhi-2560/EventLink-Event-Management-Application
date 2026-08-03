import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

function parseValue(raw, config) {
  if (config.type === 'number') {
    const parsed = Number.parseInt(raw ?? '', 10);
    const fallback = config.default ?? 1;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
  return raw ?? config.default ?? '';
}

function isEmptyValue(value, config) {
  const defaultValue = config.default ?? (config.type === 'number' ? 1 : '');
  return value === null || value === undefined || value === '' || value === defaultValue;
}

/**
 * Sync list/search UI state with URL query parameters.
 *
 * @param {Record<string, { param?: string, default?: string|number, type?: 'string'|'number' }>} schema
 */
export function useListSearchParams(schema) {
  const [searchParams, setSearchParams] = useSearchParams();

  const values = useMemo(() => {
    const parsed = {};
    for (const [key, config] of Object.entries(schema)) {
      const param = config.param ?? key;
      parsed[key] = parseValue(searchParams.get(param), config);
    }
    return parsed;
  }, [schema, searchParams]);

  const updateParams = useCallback((updates, { resetKeys = [] } = {}) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      for (const key of resetKeys) {
        const param = schema[key]?.param ?? key;
        next.delete(param);
      }

      for (const [key, value] of Object.entries(updates)) {
        const config = schema[key] ?? {};
        const param = config.param ?? key;
        if (isEmptyValue(value, config)) {
          next.delete(param);
        } else {
          next.set(param, String(value));
        }
      }

      return next;
    });
  }, [schema, setSearchParams]);

  const setParam = useCallback((key, value, options) => {
    updateParams({ [key]: value }, options);
  }, [updateParams]);

  return { ...values, updateParams, setParam };
}

/**
 * Persist a date range in the URL as `start` and `end` (YYYY-MM-DD).
 */
export function useDateRangeParams(defaultRange) {
  const { start, end, updateParams } = useListSearchParams({
    start: { default: defaultRange.start },
    end: { default: defaultRange.end },
  });

  const range = useMemo(() => ({ start, end }), [start, end]);

  const setRange = useCallback((nextRange) => {
    const resolvedRange = typeof nextRange === 'function'
      ? nextRange(range)
      : nextRange;

    updateParams({
      start: resolvedRange.start,
      end: resolvedRange.end,
    });
  }, [range, updateParams]);

  return { range, setRange };
}
