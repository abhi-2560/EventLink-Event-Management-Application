export default function Input({
    label,
    error,
    className = "",
    ...props
}) {
    return (
        <div className="space-y-1">

            {label && (
                <label className="block text-sm font-medium">
                    {label}
                </label>
            )}

            <input
                className={`
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-2.5
                    outline-none
                    focus:border-indigo-500
                    ${className}
                `}
                {...props}
            />

            {error && (
                <p className="text-sm text-red-600">
                    {error}
                </p>
            )}

        </div>
    );
}