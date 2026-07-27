export default function EventInfo({ event }) {
    return (
        <div className="rounded-xl bg-white p-6 shadow">

            <h1 className="text-4xl font-bold">
                {event.title}
            </h1>

            <p className="mt-6">
                {event.description}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">

                <Info
                    label="Venue"
                    value={event.venue}
                />

                <Info
                    label="Start Date"
                    value={event.start_date}
                />

                <Info
                    label="End Date"
                    value={event.end_date}
                />

                <Info
                    label="Registration Fee"
                    value={`$${event.registration_fee}`}
                />

                <Info
                    label="Available Seats"
                    value={event.available_seats}
                />

                <Info
                    label="Status"
                    value={event.registration_status}
                />

            </div>

        </div>
    );
}

function Info({
    label,
    value,
}) {
    return (
        <div>

            <p className="text-sm text-gray-500">
                {label}
            </p>

            <p className="font-semibold">
                {value}
            </p>

        </div>
    );
}