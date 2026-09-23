/**
 * Small presentational pieces shared by the products and carts views.
 * No state and no hooks, so they work in server and client components alike.
 */

/** Page title block: small eyebrow label, heading, description, optional button. */
export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-deep">{eyebrow}</p>
        )}
        <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}

/**
 * The round "+" on each row. Rotates 45 degrees into an "x" when open.
 * Decorative only (aria-hidden); the surrounding button carries the label.
 */
export function TogglePill({ open }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
        open ? "rotate-45 bg-brand-deep text-white" : "bg-surface text-muted ring-1 ring-line"
      }`}
    >
      +
    </span>
  );
}

/** One label and value pair inside a <dl> in the detail panels. */
export function DetailField({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value}</dd>
    </div>
  );
}

const STATUS_TONES = {
  Completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  Pending: "bg-brand-soft text-brand-ink ring-brand/40",
  Abandoned: "bg-slate-100 text-slate-700 ring-slate-300",
};

/** Colored pill for a cart's status. Unknown statuses fall back to gray. */
export function StatusBadge({ status }) {
  const tone = STATUS_TONES[status] ?? "bg-slate-100 text-slate-700 ring-slate-300";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${tone}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
