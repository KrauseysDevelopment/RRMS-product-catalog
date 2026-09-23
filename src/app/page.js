import Link from "next/link";

/**
 * Home page.
 *
 * The task asks for a home page with two buttons, one for products and one
 * for carts. These are real routes rather than in-page state, so each view is
 * linkable, shareable and independently reloadable, and the browser back
 * button behaves the way a user expects.
 */
export default function HomePage() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-white px-6 py-12 shadow-sm ring-1 ring-line sm:px-10 sm:py-20">
      {/* Slanted panels echo the angled shapes used across rrms.com. */}
      <div
        aria-hidden="true"
        className="absolute -right-24 top-0 hidden h-full w-[52%] -skew-x-12 bg-gradient-to-br from-brand to-brand-deep md:block"
      />
      <div
        aria-hidden="true"
        className="absolute -right-10 top-0 hidden h-full w-[16%] -skew-x-12 bg-white/15 md:block"
      />

      <div
        aria-hidden="true"
        className="absolute right-12 top-1/2 hidden w-64 -translate-y-1/2 rounded-xl bg-white/95 p-5 shadow-xl lg:block"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-deep">
          Three endpoints, one view
        </p>
        <ul className="mt-3 space-y-2 font-mono text-xs text-ink">
          {["/products", "/users", "/carts"].map((path) => (
            <li key={path} className="flex items-center gap-2">
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                GET
              </span>
              {path}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-muted">
          <span className="h-px flex-1 bg-line" />
          joined on the server
          <span className="h-px flex-1 bg-line" />
        </div>
      </div>

      <div className="relative max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-deep">
          Product Catalog
        </p>
        <h1 className="mt-3 text-3xl font-black uppercase leading-tight tracking-tight text-ink sm:text-4xl">
          Products and carts, <br className="hidden sm:block" />
          joined and verified.
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
          A Next.js front end over the JSONing public API. Browse the product
          catalog, or open the carts view to see orders joined to their
          customers, line items and totals.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/products"
            className="rounded-lg bg-brand-deep px-6 py-3 text-center font-bold text-white shadow-sm transition hover:bg-brand-ink"
          >
            View Products
          </Link>
          <Link
            href="/carts"
            className="rounded-lg border border-brand-deep bg-white px-6 py-3 text-center font-bold text-brand-deep transition hover:bg-brand-soft"
          >
            View Carts
          </Link>
        </div>
      </div>
    </section>
  );
}
