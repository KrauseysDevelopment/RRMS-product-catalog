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
    <div className="mx-auto max-w-2xl py-10 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        Product Catalog
      </h1>
      <p className="mx-auto mt-3 max-w-lg text-slate-600">
        A Next.js front end over the JSONing public API. Browse the product
        catalog, or open the carts view to see orders joined to their customers
        and line items.
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <a
          href="/products"
          className="rounded-lg bg-[var(--rr-navy)] px-6 py-3 font-medium text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          View Products
        </a>
        <a
          href="/carts"
          className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          View Carts
        </a>
      </div>
    </div>
  );
}
