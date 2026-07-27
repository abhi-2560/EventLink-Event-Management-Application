import { Link } from "react-router-dom";

import Container from "../common/Container";

export default function Navbar() {
    return (
        <header className="border-b bg-white">

            <Container>

                <div className="flex h-16 items-center justify-between">

                    <Link
                        to="/"
                        className="text-2xl font-bold text-indigo-600"
                    >
                        EventHub
                    </Link>

                    <nav className="flex items-center gap-8">

                        <Link to="/">
                            Home
                        </Link>

                        <Link to="/events">
                            Events
                        </Link>

                    </nav>

                </div>

            </Container>

        </header>
    );
}