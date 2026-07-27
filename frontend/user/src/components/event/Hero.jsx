import { Link } from "react-router-dom";

import Button from "../common/Button";
import Container from "../common/Container";

export default function Hero() {
    return (
        <section className="bg-indigo-600 py-24 text-white">

            <Container>

                <div className="max-w-3xl">

                    <h1 className="mb-6 text-5xl font-bold">

                        Discover Amazing Events

                    </h1>

                    <p className="mb-8 text-lg text-indigo-100">

                        Conferences, workshops,
                        hackathons and seminars —
                        all in one place.

                    </p>

                    <Link to="/events">

                        <Button
                            variant="secondary"
                        >
                            Explore Events
                        </Button>

                    </Link>

                </div>

            </Container>

        </section>
    );
}