import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

type SearchParamValue = string | number;

interface SearchParamConfig<T extends SearchParamValue = SearchParamValue> {
  param?: string;
  default?: T;
  type?: T extends number ? 'number' : 'string' | 'number';
}

type SearchParamSchema = Record<string, SearchParamConfig>;
type SchemaValues<S extends SearchParamSchema> = {
  [K in keyof S]: S[K]['default'] extends number ? number : string;
};

interface UpdateOptions<S extends SearchParamSchema> {
  resetKeys?: (keyof S & string)[];
}

function parseValue(raw: string | null, config: SearchParamConfig): SearchParamValue {
  if (config.type === 'number') {
    const parsed = Number.parseInt(raw ?? '', 10);
    const fallback = config.default ?? 1;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
  return raw ?? config.default ?? '';
}

function isEmptyValue(value: SearchParamValue | null | undefined, config: SearchParamConfig) {
  const defaultValue = config.default ?? (config.type === 'number' ? 1 : '');
  return value === null || value === undefined || value === '' || value === defaultValue;
}

/**
 * Sync list/search UI state with URL query parameters.
 *
 * @param {Record<string, { param?: string, default?: string|number, type?: 'string'|'number' }>} schema
 */
export function useListSearchParams<S extends SearchParamSchema>(schema: S) {
  const [searchParams, setSearchParams] = useSearchParams();

  const values = useMemo(() => {
    const parsed = {} as SchemaValues<S>;
    for (const [key, config] of Object.entries(schema) as [keyof S & string, S[keyof S]][]) {
      const param = config.param ?? key;
      parsed[key] = parseValue(searchParams.get(param), config) as SchemaValues<S>[typeof key];
    }
    return parsed;
  }, [schema, searchParams]);

  const updateParams = useCallback((updates: Partial<SchemaValues<S>>, { resetKeys = [] }: UpdateOptions<S> = {}) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      for (const key of resetKeys) {
        const param = schema[key]?.param ?? key;
        next.delete(param);
      }

      for (const [key, value] of Object.entries(updates) as [keyof S & string, SearchParamValue | undefined][]) {
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

  const setParam = useCallback((key: keyof S & string, value: SchemaValues<S>[typeof key], options?: UpdateOptions<S>) => {
    updateParams({ [key]: value } as Partial<SchemaValues<S>>, options);
  }, [updateParams]);

  return { ...values, updateParams, setParam };
}

/**
 * Persist a date range in the URL as `start` and `end` (YYYY-MM-DD).
 */
interface DateRange {
  start: string;
  end: string;
}

export function useDateRangeParams(defaultRange: DateRange) {
  const { start, end, updateParams } = useListSearchParams({
    start: { default: defaultRange.start },
    end: { default: defaultRange.end },
  });

  const range = useMemo(() => ({ start, end }), [start, end]);

  const setRange = useCallback((nextRange: DateRange | ((currentRange: DateRange) => DateRange)) => {
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
