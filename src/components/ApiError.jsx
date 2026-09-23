import Link from "next/link";

/**
 * Shown when the upstream API cannot be reached.
 *
 * A third-party dependency will eventually be unavailable. Surfacing that as
 * a readable message with the underlying reason beats an unhandled exception
 * or a blank page that gives the user nothing to act on.
 */
export default function ApiError({ resource, message }) {
  return (
    <div className="mx-auto max-w-xl rounded-xl border-t-4 border-red-500 bg-white p-6 shadow-sm ring-1 ring-line">
      <h1 className="text-lg font-bold text-ink">Could not load {resource}</h1>
      <p className="mt-2 text-sm text-muted">
        The JSONing API did not return data. This is an upstream issue rather
        than a problem with the page itself. Try again in a moment.
      </p>
      {message && (
        <p className="mt-3 break-words rounded-md border border-red-200 bg-red-50 px-3 py-2 font-mono text-xs text-red-800">
          {message}
        </p>
      )}
      <div className="mt-4 flex gap-3">
        <Link
          href={`/${resource}`}
          className="rounded-lg bg-brand-deep px-4 py-2 text-sm font-bold text-white hover:bg-brand-ink"
        >
          Retry
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink hover:bg-surface"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
