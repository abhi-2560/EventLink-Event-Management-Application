import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getReceipt } from "@/api/paymentApi";

import PaymentSuccess from "@/components/payment/PaymentSuccess";

export default function Receipt() {

    const { paymentId } =
        useParams();

    const [receipt, setReceipt] =
        useState(null);

    useEffect(() => {

        loadReceipt();

    }, []);

    async function loadReceipt() {

        const data =
            await getReceipt(paymentId);

        setReceipt(data);

    }

    if (!receipt)
        return null;


// Replace the temporary JSON.stringify(receipt) with a proper receipt layout showing:Receipt Number
// Event Name
// Participants
// Contact Details
// Payment Method
// Amount Paid
// Payment Date
// "Print Receipt" button (window.print())

    return (
        <div className="max-w-3xl mx-auto py-10">

            <PaymentSuccess />

            <div className="mt-8 rounded-xl bg-white p-6 shadow">

                <pre>

                    {JSON.stringify(
                        receipt,
                        null,
                        2
                    )}

                </pre>

            </div>

        </div>
    );
}