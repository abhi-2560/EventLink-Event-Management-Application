import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Container from '../../components/common/Container';
import Hero from '../../components/event/Hero';
import SearchBar, { filtersToSearchParams } from '../../components/event/SearchBar';
import EventGrid from '../../components/event/EventGrid';
import EventCard from '../../components/event/EventCard';
import { EventGridSkeleton } from '../../components/event/EventCardSkeleton';
import HomeStats from '../../components/event/HomeStats';
import WhyChooseSection from '../../components/event/WhyChooseSection';
import HomeCta from '../../components/event/HomeCta';
import { getEvents, searchEvents } from '../../api/eventApi';
import { useListSearchParams } from '../../hooks/useListSearchParams';
import { buildEventSearchFilters, hasActiveEventFilters } from '../../utils/eventSearch';
import type { EventSearchFilters } from '../../utils/eventSearch';

const SEARCH_PARAMS = {
  title: { default: '' },
  city: { default: '' },
  category: { default: '' },
  type: { default: '' },
  date: { default: '' },
  organizer: { default: '' },
};

export default function Home() {
  const urlParams = useListSearchParams(SEARCH_PARAMS);
  const { title, city, category, type, date, organizer, updateParams } = urlParams;

  const [heroSearch, setHeroSearch] = useState(title);

  useEffect(() => {
    setHeroSearch(title);
  }, [title]);

  const filters = useMemo(
    () => buildEventSearchFilters({ title, city, category, type, date, organizer }),
    [title, city, category, type, date, organizer],
  );

  const isFiltered = hasActiveEventFilters(filters);

  const { data: events, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => (filters ? searchEvents(filters) : getEvents()),
    placeholderData: (prev) => prev,
  });

  const applySearch = useCallback((nextFilters: EventSearchFilters) => {
    updateParams({
      title: nextFilters.title || '',
      city: nextFilters.city || '',
      category: nextFilters.category || '',
      type: nextFilters.type || '',
      date: nextFilters.date || '',
      organizer: nextFilters.organizer || '',
    });
    setHeroSearch(nextFilters.title || '');
  }, [updateParams]);

  const handleHeroSearch = useCallback(() => {
    applySearch(filtersToSearchParams({
      title: heroSearch,
      city,
      category,
      type,
      date,
      organizer,
    }));
  }, [applySearch, heroSearch, city, category, type, date, organizer]);

  const clearFilters = useCallback(() => {
    applySearch({});
  }, [applySearch]);

  const featuredEvents = useMemo(() => {
    if (isFiltered || !events?.length) return [];
    return events.slice(0, 3);
  }, [events, isFiltered]);

  const browseEvents = events ?? [];

  return (
    <>
      <Hero
        searchValue={heroSearch}
        onSearchChange={setHeroSearch}
        onSearchSubmit={handleHeroSearch}
      />

      <div className="relative z-10 -mt-16 sm:-mt-20">
        <Container>
          <SearchBar
            filters={{ title, city, category, type, date, organizer }}
            onSearch={applySearch}
          />
        </Container>
      </div>

      <Container className="space-y-16 py-12 sm:py-16">
        {!isLoading && !isError && browseEvents.length > 0 && (
          <section className="animate-fade-in">
            <HomeStats events={browseEvents} />
          </section>
        )}

        {!isFiltered && featuredEvents.length > 0 && (
          <section>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl text-gray-900">Featured Events</h2>
                <p className="mt-1 text-muted">Handpicked experiences happening soon</p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event) => (
                <EventCard key={event.event_id} event={event} featured />
              ))}
            </div>
          </section>
        )}

        <section id="browse-events">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl text-gray-900">
                {isFiltered ? 'Search Results' : 'Browse All Events'}
              </h2>
              <p className="mt-1 text-muted">
                {isFiltered
                  ? `${browseEvents.length} event${browseEvents.length === 1 ? '' : 's'} found`
                  : 'Discover conferences, workshops, concerts, and more'}
              </p>
            </div>
            {isFiltered && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Clear all filters
              </button>
            )}
          </div>

          {isLoading && <EventGridSkeleton count={6} />}

          {isError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>
          )}

          {!isLoading && !isError && (
            <div className={isFetching ? 'opacity-70 transition-opacity' : ''}>
              <EventGrid
                events={browseEvents}
                isFiltered={isFiltered}
                onClearFilters={clearFilters}
              />
            </div>
          )}
        </section>
      </Container>

      <WhyChooseSection />
      <HomeCta onBrowse={() => document.getElementById('browse-events')?.scrollIntoView({ behavior: 'smooth' })} />
    </>
  );
}
