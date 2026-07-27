import api from "./axios";

export async function getEvents(params = {}) {
    const { data } = await api.get("/events", {
        params,
    });

    return data;
}
function normalizeEvent(event) {
    return {
        id: event.id,
        title: event.event_name,
        description: event.description,
        venue: event.venue,
        startDate: event.start_date,
        endDate: event.end_date,
        registrationFee: event.registration_fee,
        availableSeats: event.available_seats,
        registrationStatus: event.registration_status,
        organizer: event.organizer,
        banner: event.banner_url,
    };
}


export async function getEvent(id) {
    const { data } = await api.get(`/events/${id}`);
    return data;
}