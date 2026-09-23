/**
 * Data access layer for the JSONing public mock API.
 *
 * The task supplies three INDEPENDENT resources:
 *
 *   /products  -> { id: STRING, name, description, price, category, stock, sku, image_url, rating:{rate,count} }
 *   /users     -> { id: STRING, firstname, lastname, email, username, address, city, state, zipcode, country, phone }
 *   /carts     -> { id: STRING, userId: NUMBER|null, items: [{ productId: NUMBER, quantity: NUMBER }], date, status }
 *
 * A cart, on its own, cannot satisfy the required detail view. It carries only
 * a userId and a list of productIds. The screen has to show the user's name,
 * email, city/state/zip and phone, plus each product's name and description.
 * None of that lives on the cart. So the three resources have to be joined
 * client-side into a single in-memory view. That join is the core of this app.
 *
 * Two traps in the real payload drive the design here:
 *
 *   1. TYPE MISMATCH on the join keys. Product and user `id` are strings
 *      ("5"), but cart `userId` and `productId` are numbers (5). A naive
 *      `users.find(u => u.id === cart.userId)` silently returns undefined on
 *      every row, because "5" === 5 is false. Every key is normalised through
 *      `key()` before it is stored or looked up.
 *
 *   2. REFERENTIAL GAPS. The live data contains carts pointing at userId 8 and
 *      userId 17, but only users 1-5 exist. Another cart has userId null. Three
 *      of the five carts therefore have no resolvable user. Rather than render
 *      "undefined undefined", unresolved references are modelled explicitly so
 *      the UI can say what is actually true about the data.
 */

// Overridable so the app can be pointed at a local fixture server during
// development or testing without touching code.
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.jsoning.com/mock/public";

/** Normalise any id to a string so numeric and string keys compare equal. */
const key = (value) => (value === null || value === undefined ? null : String(value));

/**
 * Money is added in whole cents, then converted back to dollars once.
 * Floating point cannot store most cent values exactly, so adding dollars
 * directly drifts: 0.1 + 0.2 is 0.30000000000000004.
 */
const toCents = (dollars) => Math.round(Number(dollars) * 100);

/**
 * Fetch one resource.
 *
 * `revalidate: 300` opts into Next's data cache: the response is reused for
 * five minutes across requests instead of hitting the upstream API on every
 * page load. The mock data is static, so this costs nothing in freshness and
 * keeps the hosted deployment responsive.
 */
async function fetchResource(resource) {
  const response = await fetch(`${BASE_URL}/${resource}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${resource}: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetch all three resources and assemble them into one joined view.
 *
 * The three requests are independent, so they are issued together with
 * Promise.all rather than awaited one after another. Serially this would be
 * three round trips end to end; in parallel it is one round trip's worth of
 * latency.
 */
export async function getCatalog() {
  const [products, users, carts] = await Promise.all([
    fetchResource("products"),
    fetchResource("users"),
    fetchResource("carts"),
  ]);

  // Index once, then look up in constant time.
  //
  // The alternative is calling products.find(...) inside the loop over each
  // cart's items, which re-scans the product array for every line item. With
  // this dataset either approach is instant, but the indexed version is the
  // one that still holds up when the API returns 10,000 products instead of 10.
  const productsById = new Map(products.map((p) => [key(p.id), p]));
  const usersById = new Map(users.map((u) => [key(u.id), u]));

  const joinedCarts = carts.map((cart) => joinCart(cart, usersById, productsById));

  return { products, users, carts: joinedCarts };
}

/**
 * Resolve a single cart's foreign keys into the objects the UI needs.
 *
 * Returns the original cart fields plus:
 *   user       - the resolved user, or null
 *   userStatus - why the user is missing, when it is: "ok" | "guest" | "missing"
 *   lineItems  - each item with its product, unit price and line total
 *   itemCount  - total units in the cart (sum of quantities, not line count)
 *   subtotal   - sum of the line totals, in dollars
 *   displayDate - the cart date, formatted once on the server
 */
function joinCart(cart, usersById, productsById) {
  const userId = key(cart.userId);
  const user = userId === null ? null : usersById.get(userId) ?? null;

  // Distinguish the two ways a cart can lack a user. An anonymous cart is
  // normal; a cart pointing at a user id that does not exist is a data
  // integrity problem, and the UI should not present them identically.
  let userStatus = "ok";
  if (userId === null) userStatus = "guest";
  else if (!user) userStatus = "missing";

  const lineItems = (cart.items ?? []).map((item) => {
    const product = productsById.get(key(item.productId)) ?? null;
    const quantity = item.quantity ?? 0;
    return {
      productId: item.productId,
      quantity,
      product,
      resolved: Boolean(product),
      unitPrice: product ? product.price : null,
      // Line total in cents: price times quantity. Unresolved products have
      // no price, so they contribute nothing and are flagged in the UI.
      lineCents: product ? toCents(product.price) * quantity : 0,
    };
  });

  // "Number of items in the cart" is ambiguous: distinct products, or total
  // units? Total units is the more useful reading for a cart, so quantities
  // are summed. The list view labels the column "Items" and the detail view
  // shows the per-line quantities, so both readings are visible to the user.
  const itemCount = lineItems.reduce((sum, line) => sum + line.quantity, 0);

  const subtotal = lineItems.reduce((sum, line) => sum + line.lineCents, 0) / 100;

  // Format the date here, on the server, and hand the client a finished
  // string. Browsers and Node ship different ICU data, so the same
  // Intl.DateTimeFormat call can produce "Aug 9, 2024, 2:32 PM" on the server
  // and "Aug 9, 2024 at 2:32 PM" in Chrome. That difference is a React
  // hydration mismatch. One formatter, one output.
  const displayDate = formatDate(cart.date);

  return {
    ...cart,
    userId,
    user,
    userStatus,
    lineItems: lineItems.map(({ lineCents, ...line }) => ({
      ...line,
      lineTotal: line.resolved ? lineCents / 100 : null,
    })),
    itemCount,
    subtotal,
    displayDate,
  };
}

/** Display helpers kept next to the shape they format. */

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value ?? 0);
}

export function formatDate(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

/** The label for a cart's customer, accounting for the two failure modes. */
export function cartUserLabel(cart) {
  if (cart.userStatus === "guest") return "Guest checkout";
  if (cart.userStatus === "missing") return `Unknown customer #${cart.userId}`;
  return `${cart.user.firstname} ${cart.user.lastname}`;
}
