export default function ServerUnavailable({ onRetry }: { onRetry?: () => void }) {
  return (
    <section className="mx-auto my-8 max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-900">
      <h2 className="text-lg font-semibold">Our servers are temporarily unavailable.</h2>
      <p className="mt-2 text-sm">Unable to connect to the server. Please try again in a few moments.</p>
      {onRetry && (
        <button type="button" className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white" onClick={onRetry}>
          Try again
        </button>
      )}
    </section>
  );
}
