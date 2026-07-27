export default function Button({
    children,
    type = "button",
    variant = "primary",
    className = "",
    disabled = false,
    ...props
}) {
    const variants = {
        primary:
            "bg-indigo-600 hover:bg-indigo-700 text-white",

        secondary:
            "bg-white border border-gray-300 hover:bg-gray-100",

        danger:
            "bg-red-600 hover:bg-red-700 text-white",
    };

    return (
        <button
            type={type}
            disabled={disabled}
            className={`
                rounded-lg
                px-5
                py-2.5
                font-medium
                transition
                disabled:opacity-60
                disabled:cursor-not-allowed
                ${variants[variant]}
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    );
}