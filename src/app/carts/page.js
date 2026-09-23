import { getCatalog } from "@/lib/api";
import CartsView from "@/components/CartsView";
import ApiError from "@/components/ApiError";

/**
 * Carts route.
 *
 * Server component, same reasoning as /products. This is the route that
 * actually needs all three API resources, since a cart carries only foreign
 * keys: a userId and a list of productIds. The join that turns those into
 * displayable records happens in lib/api.js before this component renders.
 *
 * Per-request rendering for the same reason as /products: the build should not
 * depend on a third-party API being up.
 */
export const dynamic = "force-dynamic";

export const metadata = { title: "Carts | RRMS Catalog" };

export default async function CartsPage() {
  // Only the fetch goes inside try. A try/catch around JSX would not catch
  // render errors anyway, because React renders the component later; those
  // are handled by app/error.js, the route's error boundary.
  let carts;
  try {
    ({ carts } = await getCatalog());
  } catch (error) {
    return <ApiError resource="carts" message={error.message} />;
  }
  return <CartsView carts={carts} />;
}
