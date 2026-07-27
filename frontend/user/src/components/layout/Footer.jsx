import Container from "../common/Container";

export default function Footer() {
    return (
        <footer className="mt-20 border-t bg-white">

            <Container>

                <div className="py-8 text-center text-sm text-gray-500">

                    © {new Date().getFullYear()} Event Registration System

                </div>

            </Container>

        </footer>
    );
}