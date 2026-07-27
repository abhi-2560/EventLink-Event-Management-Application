export default function SearchBar({
    value,
    onChange,
}) {
    return (
        <input
            value={value}
            onChange={onChange}
            placeholder="Search events..."
            className="
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-5
                py-3
            "
        />
    );
}