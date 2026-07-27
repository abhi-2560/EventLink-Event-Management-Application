import { useState } from "react";
import Button from "../common/Button";

const METHODS = [
    "UPI",
    "Credit Card",
    "Debit Card",
    "Net Banking",
];

export default function PaymentMethodSelector({
    onContinue,
}) {
    const [method, setMethod] = useState("UPI");

    return (
        <div className="rounded-xl bg-white p-6 shadow">

            <h2 className="text-2xl font-bold mb-6">
                Select Payment Method
            </h2>

            <div className="space-y-3">

                {METHODS.map((item) => (

                    <label
                        key={item}
                        className="flex items-center gap-3"
                    >
                        <input
                            type="radio"
                            checked={method === item}
                            onChange={() =>
                                setMethod(item)
                            }
                        />

                        {item}

                    </label>

                ))}

            </div>

            <Button
                className="mt-8"
                onClick={() =>
                    onContinue(method)
                }
            >
                Continue
            </Button>

        </div>
    );
}