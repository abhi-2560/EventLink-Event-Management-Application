import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Container from '../../components/common/Container';
import Hero from '../../components/event/Hero';
import SearchBar from '../../components/event/SearchBar';
import EventGrid from '../../components/event/EventGrid';
import Loader from '../../components/common/Loader';
import { getEvents, searchEvents } from '../../api/eventApi';

export default function Home() {
  const [filters, setFilters] = useState(null);

  const { data: events, isLoading, isError, error } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => (filters && Object.keys(filters).length > 0 ? searchEvents(filters) : getEvents()),
  });

  return (
    <>
      <Hero />
      <Container className="py-10">
        <SearchBar onSearch={setFilters} />
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
