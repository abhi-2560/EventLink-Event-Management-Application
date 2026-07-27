import Container from "../common/Container";

export default function EventBanner({ event }) {
    return (
        <section className="bg-white border-b">

            <Container>

                <div className="py-10">

                    <img
                        src={
                            event.banner ||
                            "https://placehold.co/1200x500"
                        }
                        alt={event.title}
                        className="h-96 w-full rounded-xl object-cover"
                    />

                </div>

            </Container>

        </section>
    );
}