import { useEffect, useState } from "react";

import Container from "@/components/common/Container";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";

import EventGrid from "@/components/event/EventGrid";
import SearchBar from "@/components/event/SearchBar";

import { getEvents } from "@/api/eventApi";

export default function Events() {
    const [events, setEvents] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    useEffect(() => {
        loadEvents();
    }, []);

    async function loadEvents() {
        try {
            const data =
                await getEvents();

            setEvents(data);
        } catch (err) {
            console.log(err);
        }

        setLoading(false);
    }

    if (loading)
        return <Loader />;

    const filtered =
        events.filter((event) =>
            event.title
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                )
        );

    return (
        <Container>

            <div className="py-10">

                <h1 className="mb-6 text-4xl font-bold">

                    Events

                </h1>

                <SearchBar
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

                <div className="mt-8">

                    {filtered.length ===
                    0 ? (
                        <EmptyState
                            title="No Events"
                            description="No events found."
                        />
                    ) : (
                        <EventGrid
                            events={filtered}
                        />
                    )}

                </div>

            </div>

        </Container>
    );
}