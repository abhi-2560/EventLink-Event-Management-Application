export default function OrganizerCard({
    event,
}) {
    return (
        <div className="rounded-xl bg-white p-6 shadow">

            <h2 className="mb-4 text-xl font-semibold">

                Organizer

            </h2>

            <p>{event.organizer_name}</p>

            <p className="mt-2 text-gray-600">
                {event.organizer_email}
            </p>

        </div>
    );
}