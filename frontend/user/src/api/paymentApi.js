import api from "./axios";

export async function createPayment(payload) {
    const { data } = await api.post(
        "/payments",
        payload
    );

    return data;
}

export async function getReceipt(paymentId) {
    const { data } = await api.get(
        `/payments/${paymentId}/receipt`
    );

    return data;
}