import { getCatalog } from "@/lib/api";
import ProductsView from "@/components/ProductsView";
import ApiError from "@/components/ApiError";

/**
 * Products route.
 *
 * This is a server component. The fetch happens on the server before any HTML
 * is sent, so the browser receives a fully populated page instead of an empty
 * shell that pops in after a client-side request. No loading spinner, no
 * layout shift, and no API surface exposed to the client.
 *
 * Interactivity (expanding a row, opening the add form) needs browser state,
 * so that part is delegated to a client component.
 *
 * Rendered per request rather than prerendered at build time. This data comes
 * from a live third-party API, and prerendering would couple every deployment
 * to that API being reachable during the build: if JSONing is down when Vercel
 * builds, the deploy fails outright. Per-request rendering means the app
 * deploys regardless and degrades to a readable error only if the API is
 * unavailable when someone actually loads the page.
 */
export const dynamic = "force-dynamic";

export const metadata = { title: "Products | RRMS Catalog" };

export default async function ProductsPage() {
  // Only the fetch goes inside try. A try/catch around JSX would not catch
  // render errors anyway, because React renders the component later; those
  // are handled by app/error.js, the route's error boundary.
  let products;
  try {
    ({ products } = await getCatalog());
  } catch (error) {
    return <ApiError resource="products" message={error.message} />;
  }
  return <ProductsView products={products} />;
}
