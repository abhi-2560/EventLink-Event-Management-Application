import { useNavigate } from "react-router-dom";

import Button from "../common/Button";

export default function RegistrationCard({
    event,
}) {
    const navigate = useNavigate();

    const disabled =
        event.registration_status !==
            "OPEN" ||
        event.available_seats <= 0;

    return (
        <div className="rounded-xl bg-white p-6 shadow">

            <h2 className="text-xl font-bold">

                Registration

            </h2>

            <div className="mt-6 space-y-3">

                <Row
                    label="Fee"
                    value={`$${event.registration_fee}`}
                />

                <Row
                    label="Seats Left"
                    value={event.available_seats}
                />

                <Row
                    label="Status"
                    value={event.registration_status}
                />

            </div>

            <Button
                disabled={disabled}
                className="mt-8 w-full"
                onClick={() =>
                    navigate(
                        `/register/${event.id}`
                    )
                }
            >
                Register Now
            </Button>

        </div>
    );
}

function Row({
    label,
    value,
}) {
    return (
        <div className="flex justify-between">

            <span>{label}</span>

            <span className="font-semibold">
                {value}
            </span>

        </div>
    );
}