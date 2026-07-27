import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PaymentMethodSelector from "@/components/payment/PaymentMethodSelector";
import PaymentSummary from "@/components/payment/PaymentSummary";
import { createPayment } from "@/api/paymentApi";
import { useRegistration } from "@/context/RegistrationContext";

export default function Payment() {
    const navigate = useNavigate();

    const { registration } =
        useRegistration();

    const [method, setMethod] =
        useState(null);

    async function pay() {

        const payment =
            await createPayment({

                registrationId:
                    registration.id,

                method,

            });

        navigate(
            `/receipt/${payment.id}`
        );
    }

    if (!method)
        return (
            <PaymentMethodSelector
                onContinue={setMethod}
            />
        );

    return (
        <PaymentSummary
            registration={registration}
            method={method}
            onPay={pay}
        />
    );
}