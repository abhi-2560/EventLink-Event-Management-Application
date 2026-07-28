import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { CATEGORIES, EVENT_TYPES } from '../../utils/constants';

export default function SearchBar({ onSearch, initialFilters = {} }) {
  const [filters, setFilters] = useState({
    title: initialFilters.title || '',
    city: initialFilters.city || '',
    category: initialFilters.category || '',
    type: initialFilters.type || '',
    keyword: initialFilters.keyword || '',
    date: initialFilters.date || '',
    organizer: initialFilters.organizer || '',
  });
  const [expanded, setExpanded] = useState(false);

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== ''),
    );
    onSearch(params);
  };

  const handleReset = () => {
    const empty = {
      title: '', city: '', category: '', type: '', keyword: '', date: '', organizer: '',
    };
    setFilters(empty);
    onSearch({});
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by title, keyword..."
            value={filters.title || filters.keyword}
            onChange={(e) => {
              handleChange('title', e.target.value);
              handleChange('keyword', e.target.value);
            }}
            className="w-full rounded-lg border border-border py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => setExpanded(!expanded)}>
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
          <Button type="submit">Search</Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="City / Location"
            value={filters.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="e.g. Indore"
          />
          <Input
            label="Organizer"
            value={filters.organizer}
            onChange={(e) => handleChange('organizer', e.target.value)}
            placeholder="Organizer name"
          />
          <Input
            label="Date"
            type="date"
            value={filters.date}
            onChange={(e) => handleChange('date', e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={filters.category}
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
              value={filters.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {EVENT_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button type="button" variant="ghost" onClick={handleReset} className="w-full">
              Clear filters
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
