import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Container from '../../components/common/Container';
import Hero from '../../components/event/Hero';
import SearchBar from '../../components/event/SearchBar';
import EventGrid from '../../components/event/EventGrid';
import Loader from '../../components/common/Loader';
import { getEvents, searchEvents } from '../../api/eventApi';
import { useListSearchParams } from '../../hooks/useListSearchParams';

const SEARCH_PARAMS = {
  title: { default: '' },
  keyword: { default: '' },
  city: { default: '' },
  category: { default: '' },
  type: { default: '' },
  date: { default: '' },
  organizer: { default: '' },
};

export default function Home() {
  const urlParams = useListSearchParams(SEARCH_PARAMS);

  const filters = useMemo(() => {
    const active = {};
    for (const key of Object.keys(SEARCH_PARAMS)) {
      if (urlParams[key]) active[key] = urlParams[key];
    }
    return Object.keys(active).length ? active : null;
  }, [urlParams]);

  const { data: events, isLoading, isError, error } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => (filters ? searchEvents(filters) : getEvents()),
  });

  const handleSearch = (nextFilters) => {
    urlParams.updateParams({
      title: nextFilters.title || '',
      keyword: nextFilters.keyword || '',
      city: nextFilters.city || '',
      category: nextFilters.category || '',
      type: nextFilters.type || '',
      date: nextFilters.date || '',
      organizer: nextFilters.organizer || '',
    });
  };

  return (
    <>
      <Hero />
      <Container className="py-10">
        <SearchBar filters={urlParams} onSearch={handleSearch} />
        <div className="mt-8">
          {isLoading && <Loader message="Finding events..." />}
          {isError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>
          )}
          {!isLoading && !isError && <EventGrid events={events} />}
        </div>
      </Container>
    </>
  );
}
