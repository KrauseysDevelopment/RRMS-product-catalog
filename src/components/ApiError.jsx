/**
 * Shown when the upstream API cannot be reached.
 *
 * A third-party dependency will eventually be unavailable. Surfacing that as
 * a readable message with the underlying reason beats an unhandled exception
 * or, worse, a blank page that gives the user nothing to act on.
 */
export default function ApiError({ resource, message }) {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-red-200 bg-red-50 p-6">
      <h1 className="text-lg font-semibold text-red-900">
        Could not load {resource}
      </h1>
      <p className="mt-2 text-sm text-red-800">
        The JSONing API did not return data. This is an upstream issue rather
        than a problem with the page itself.
      </p>
      {message && (
        <p className="mt-3 break-words rounded border border-red-200 bg-white px-3 py-2 font-mono text-xs text-red-700">
          {message}
        </p>
      )}
      <a
        href="/"
        className="mt-4 inline-block rounded border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-100"
      >
        Back to home
      </a>
    </div>
  );
}
