import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
    return (
        <div className="rounded-xl bg-white p-10 text-center shadow">

            <CheckCircle
                size={72}
                className="mx-auto text-green-600"
            />

            <h2 className="mt-5 text-3xl font-bold">

                Payment Successful

            </h2>

            <p className="mt-3 text-gray-600">

                Your registration has been confirmed.

            </p>

        </div>
    );
}