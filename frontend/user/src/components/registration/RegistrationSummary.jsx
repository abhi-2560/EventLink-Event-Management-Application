import Button from "../common/Button";

export default function RegistrationSummary({
    event,
    participants,
    contact,
    onSubmit,
}) {

    return (

        <div className="rounded-xl bg-white p-6 shadow">

            <h2 className="text-2xl font-bold">

                Registration Summary

            </h2>

            <div className="mt-6">

                <p>

                    Event

                    <strong>

                        {" "}
                        {event.title}

                    </strong>

                </p>

                <p>

                    Participants

                    <strong>

                        {" "}
                        {participants.length}

                    </strong>

                </p>

                <p>

                    Contact

                    <strong>

                        {" "}
                        {contact.name}

                    </strong>

                </p>

                <p>

                    Total

                    <strong>

                        {" "}
                        $
                        {participants.length *
                            event.registrationFee}

                    </strong>

                </p>

            </div>

            <Button
                className="mt-8"
                onClick={onSubmit}
            >
                Proceed to Payment
            </Button>

        </div>

    );

}