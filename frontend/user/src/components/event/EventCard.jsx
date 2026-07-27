import { Link } from "react-router-dom";

import Button from "../common/Button";

export default function EventCard({
    event,
}) {
    return (
        <div className="overflow-hidden rounded-xl bg-white shadow">

            <img
                src={
                    event.banner ||
                    "https://placehold.co/600x300"
                }
                alt={event.title}
                className="h-48 w-full object-cover"
            />

            <div className="p-5">

                <h2 className="text-xl font-semibold">

                    {event.title}

                </h2>

                <p className="mt-2 text-gray-600">

                    {event.venue}

                </p>

                <p className="mt-2">

                    {event.start_date}

                </p>

                <p className="mt-2 font-semibold">

                    ${event.registration_fee}

                </p>

                <Link
                    to={`/events/${event.id}`}
                >
                    <Button
                        className="mt-5 w-full"
                    >
                        View Details
                    </Button>
                </Link>

            </div>

        </div>
    );
}