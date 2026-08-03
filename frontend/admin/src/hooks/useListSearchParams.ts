import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

type ParamConfig = { param?: string; default?: string | number; type?: string };
type ParamSchema = Record<string, ParamConfig>;
type ParamValues<T extends ParamSchema> = { [K in keyof T]: T[K]['default'] extends number ? number : string };

function parseValue(raw: string | null, config: ParamConfig): string | number {
  if (config.type === 'number') {
    const parsed = Number.parseInt(raw ?? '', 10);
    const fallback = config.default ?? 1;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
  return raw ?? config.default ?? '';
}

function isEmptyValue(value: string | number | null | undefined, config: ParamConfig) {
  const defaultValue = config.default ?? (config.type === 'number' ? 1 : '');
  return value === null || value === undefined || value === '' || value === defaultValue;
}

/**
 * Sync list/search UI state with URL query parameters.
 *
 * @param {Record<string, { param?: string, default?: string|number, type?: 'string'|'number' }>} schema
 */
export function useListSearchParams<T extends ParamSchema>(schema: T) {
  const [searchParams, setSearchParams] = useSearchParams();

  const values = useMemo(() => {
    const parsed = {} as ParamValues<T>;
    for (const [key, config] of Object.entries(schema)) {
      const param = config.param ?? key;
      parsed[key as keyof T] = parseValue(searchParams.get(param), config) as ParamValues<T>[keyof T];
    }
    return parsed;
  }, [schema, searchParams]);

  const updateParams = useCallback((updates: Partial<Record<keyof T | string, string | number | null | undefined>>, { resetKeys = [] }: { resetKeys?: string[] } = {}) => {
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

  const setParam = useCallback((key: string, value: string | number | null | undefined, options?: { resetKeys?: string[] }) => {
    updateParams({ [key]: value } as Partial<Record<keyof T | string, string | number | null | undefined>>, options);
  }, [updateParams]);

  return { ...values, updateParams, setParam };
}

/**
 * Persist a date range in the URL as `start` and `end` (YYYY-MM-DD).
 */
export function useDateRangeParams(defaultRange: { start: string; end: string }) {
  const { start, end, updateParams } = useListSearchParams({
    start: { default: defaultRange.start },
    end: { default: defaultRange.end },
  });

  const range = useMemo(() => ({ start, end }), [start, end]);

  const setRange = useCallback((nextRange: { start: string; end: string } | ((current: { start: string; end: string }) => { start: string; end: string })) => {
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
