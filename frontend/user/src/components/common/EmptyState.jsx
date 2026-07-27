export default function EmptyState({
    title,
    description,
}) {
    return (
        <div className="py-24 text-center">

            <h2 className="mb-3 text-2xl font-bold">
                {title}
            </h2>

            <p className="text-gray-600">
                {description}
            </p>

        </div>
    );
}