import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { CATEGORIES, EVENT_TYPES } from '../../utils/constants';

import useDebounce from '../../hooks/useDebounce';



const EMPTY_FILTERS = {
  title: '',
  city: '',
  category: '',
  type: '',
  date: '',
  organizer: '',
};

/** Build params for API — title only for text search (never duplicate keyword). */
export function filtersToSearchParams(localFilters) {
  const params = {};
  if (localFilters.title?.trim()) params.title = localFilters.title.trim();
  if (localFilters.city?.trim()) params.city = localFilters.city.trim();
  if (localFilters.category?.trim()) params.category = localFilters.category.trim();
  if (localFilters.type?.trim()) params.type = localFilters.type.trim();
  if (localFilters.date?.trim()) params.date = localFilters.date.trim();
  if (localFilters.organizer?.trim()) params.organizer = localFilters.organizer.trim();
  return params;
}

export default function SearchBar({ filters = EMPTY_FILTERS, onSearch, compact = false }) {
  const [localFilters, setLocalFilters] = useState(EMPTY_FILTERS);
  const [expanded, setExpanded] = useState(false);


  const debouncedFilters = useDebounce(localFilters, 750);

  useEffect(() => {
    setLocalFilters({
      title: filters.title || '',
      city: filters.city || '',
      category: filters.category || '',
      type: filters.type || '',
      date: filters.date || '',
      organizer: filters.organizer || '',
    });
  }, [filters.title, filters.city, filters.category, filters.type, filters.date, filters.organizer]);

  useEffect(() => {
    onSearch(filtersToSearchParams(debouncedFilters));
  }, [debouncedFilters, onSearch]);

  const handleChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filtersToSearchParams(localFilters));
  };

  const handleReset = () => {
    setLocalFilters(EMPTY_FILTERS);
    onSearch({});
  };

  const hasFilters = Object.values(localFilters).some(Boolean);

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border border-border bg-white shadow-lg ${compact ? 'p-4' : 'p-4 sm:p-6'}`}
    >
      {!compact && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Refine your search</h3>
          {hasFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
            >
              <X className="h-4 w-4" />
              Clear all
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search by event name..."
            value={localFilters.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full rounded-lg border border-border py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => setExpanded(!expanded)}>
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
          <Button type="submit">Apply</Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="City / Location"
            value={localFilters.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="e.g. Mumbai"
          />
          <Input
            label="Organizer"
            value={localFilters.organizer}
            onChange={(e) => handleChange('organizer', e.target.value)}
            placeholder="Organizer name"
          />
          <Input
            label="Date"
            type="date"
            value={localFilters.date}
            onChange={(e) => handleChange('date', e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={localFilters.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Event type</label>
            <select
              value={localFilters.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {EVENT_TYPES.map(({ value, label }) => (
                <option key={value || 'all'} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </form>
  );
}
