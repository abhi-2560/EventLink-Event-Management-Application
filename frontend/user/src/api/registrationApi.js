import api from "./axios";

export async function createRegistration(payload) {
    const { data } = await api.post(
        "/registrations",
        payload
    );

    return data;
}