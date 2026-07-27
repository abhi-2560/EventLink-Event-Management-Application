import Button from "../common/Button";

export default function PaymentSummary({
    registration,
    method,
    onPay,
}) {

    return (

        <div className="rounded-xl bg-white p-6 shadow">

            <h2 className="text-2xl font-bold">

                Payment Summary

            </h2>

            <div className="mt-6 space-y-3">

                <Row
                    label="Participants"
                    value={registration.participants.length}
                />

                <Row
                    label="Amount"
                    value={`$${registration.total}`}
                />

                <Row
                    label="Method"
                    value={method}
                />

            </div>

            <Button
                className="mt-8 w-full"
                onClick={onPay}
            >
                Pay Now
            </Button>

        </div>

    );

}

function Row({ label, value }) {
    return (
        <div className="flex justify-between">

            <span>{label}</span>

            <span className="font-semibold">
                {value}
            </span>

        </div>
    );
}