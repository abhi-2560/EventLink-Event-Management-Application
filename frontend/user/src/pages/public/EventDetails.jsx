import {
    useEffect,
    useState,
} from "react";

import { useParams } from "react-router-dom";

import Container from "@/components/common/Container";
import Loader from "@/components/common/Loader";

import EventBanner from "@/components/event/EventBanner";
import EventInfo from "@/components/event/EventInfo";
import OrganizerCard from "@/components/event/OrganizerCard";
import RegistrationCard from "@/components/event/RegistrationCard";

import { getEvent } from "@/api/eventApi";

export default function EventDetails() {
    const { id } = useParams();

    const [event, setEvent] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        loadEvent();
    }, []);

    async function loadEvent() {
        try {
            const data =
                await getEvent(id);

            setEvent(data);
        } catch (err) {
            console.log(err);
        }

        setLoading(false);
    }

    if (loading)
        return <Loader />;

    return (
        <>

            <EventBanner
                event={event}
            />

            <Container>

                <div
                    className="
                        my-10
                        grid
                        gap-8
                        lg:grid-cols-3
                    "
                >

                    <div className="space-y-8 lg:col-span-2">

                        <EventInfo
                            event={event}
                        />

                        <OrganizerCard
                            event={event}
                        />

                    </div>

                    <RegistrationCard
                        event={event}
                    />

                </div>

            </Container>

        </>
    );
}