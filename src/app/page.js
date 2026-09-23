import Link from "next/link";
import { getCatalog } from "@/lib/api";

/**
 * Home page.
 *
 * The task asks for a home page with two buttons, one for products and one
 * for carts. These are real routes rather than in-page state, so each view is
 * linkable, shareable and independently reloadable, and the browser back
 * button behaves the way a user expects.
 *
 * The "at a glance" card reuses the same getCatalog() call as the other
 * pages. If the data can't be loaded, the card is simply left out: the two
 * buttons are what the page is for, so they should never depend on it.
 */
export const dynamic = "force-dynamic";

async function loadSummary() {
  try {
    const { products, carts } = await getCatalog();
    return {
      products: products.length,
      categories: new Set(products.map((p) => p.category)).size,
      carts: carts.length,
      needsReview: carts.filter((c) => c.userStatus !== "ok").length,
    };
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const summary = await loadSummary();

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

      {/* Live summary card, desktop only (lg:block). Left out entirely if
          the data could not be loaded. */}
      {summary && (
        <div className="absolute right-12 top-1/2 hidden w-64 -translate-y-1/2 rounded-xl bg-white/95 p-5 shadow-xl lg:block">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-deep">
            At a glance
          </h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
            <Figure label="Products" value={summary.products} />
            <Figure label="Categories" value={summary.categories} />
            <Figure label="Carts" value={summary.carts} />
            <Figure label="Needs review" value={summary.needsReview} tone="warn" />
          </dl>
        </div>
      )}

      <div className="relative max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-deep">
          Product Catalog
        </p>
        <h1 className="mt-3 text-3xl font-black uppercase leading-tight tracking-tight text-ink sm:text-4xl">
          Catalog and orders, <br className="hidden sm:block" />
          in one place.
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
          Browse products and stock levels, review customer carts and order
          totals, and add new products to the catalog.
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

/** One number in the At a glance card. `tone="warn"` renders it in amber. */
function Figure({ label, value, tone }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</dt>
      <dd className={`mt-0.5 text-2xl font-black tabular-nums ${tone === "warn" ? "text-amber-700" : "text-ink"}`}>
        {value}
      </dd>
    </div>
  );
}
