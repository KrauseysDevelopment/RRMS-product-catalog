# RRMS Product Catalog

Submission for the Rapid Response Monitoring Services SE development task.

A Next.js application that consumes the JSONing public mock API and presents
products and carts, including full detail views and a validated create form.

**Live:** _(deployment URL)_
**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4

---

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

No environment variables are required. `NEXT_PUBLIC_API_BASE_URL` can
optionally override the API host for local testing.

---

## What it does

| Requirement | Where |
|---|---|
| Home page with Products and Carts buttons | `src/app/page.js` |
| Product list with name, price, category, stock | `src/components/ProductsView.jsx` |
| Product detail with all fields, dismissible | `ProductDetail` in the same file |
| Add Product form, all fields mandatory, success message | `src/components/AddProductForm.jsx` |
| Cart list with customer, date, status, item count | `src/components/CartsView.jsx` |
| Cart detail with contact info and line items | `CartDetail` in the same file |
| API consumption and joining | `src/lib/api.js` |

---

## Design notes

### The three endpoints have to be joined

The API exposes `/products`, `/users` and `/carts` independently. A cart record
carries only foreign keys:

```json
{ "id": "1", "userId": 5, "items": [{ "productId": 2, "quantity": 1 }], ... }
```

But the required cart detail view has to show the customer's name, email,
city, state, zip and phone, plus each product's name and description. None of
that lives on the cart. All three resources are fetched and joined into a
single in-memory view in `src/lib/api.js`.

The three requests are independent, so they are issued with `Promise.all`
rather than sequentially. Users and products are then indexed into `Map`s by
id, so resolving a cart's references is a constant-time lookup instead of a
linear scan per line item.

### Two traps in the live data

**Join keys have mismatched types.** Product and user `id` are strings
(`"5"`). Cart `userId` and `productId` are numbers (`5`). A naive
`users.find(u => u.id === cart.userId)` returns `undefined` on every row,
because `"5" === 5` is false. Every key is normalised to a string before it is
stored or looked up.

**Referential integrity is broken.** The live data contains carts pointing at
`userId` 8 and 17, but only users 1 through 5 exist. Another cart has
`userId: null`. Three of the five carts therefore have no resolvable customer.

Rather than render "undefined undefined", each cart is tagged with a
`userStatus` of `ok`, `guest` (no userId at all) or `missing` (points at a user
that does not exist). The UI distinguishes the two failure modes, because an
anonymous cart is normal while a dangling foreign key is a data problem.

### Rendering strategy

Both data routes are server components marked `dynamic = "force-dynamic"`.

Server rendering means the browser receives populated HTML rather than an
empty shell that fills in after a client fetch: no spinner, no layout shift.

Forcing dynamic rendering keeps the build independent of the third-party API.
Prerendering at build time would mean a failed deploy any time JSONing is
unreachable during a build. Rendering per request means the app always
deploys and degrades to a readable error only if the API is down when a user
actually loads the page.

Interactivity (expanding a detail row, the add form) needs browser state, so
those pieces are client components that receive already-joined data as props.
The join logic stays in one place.

Dates are formatted on the server, inside the join, and passed to the client
as finished strings. Node and each browser ship their own ICU locale data, so
the same `Intl.DateTimeFormat` call can print `Aug 9, 2024, 2:32 PM` on the
server and `Aug 9, 2024 at 2:32 PM` in Chrome. Formatting in a client
component would make the server HTML and the client render disagree, which
React reports as a hydration mismatch. Formatting once avoids that.

### Form validation

Validation runs in two layers. Native HTML constraints (`required`, `type`,
`min`, `max`, `step`) give the browser and assistive technology correct
semantics. An explicit JS pass then enforces the rules native constraints
cannot express: rating between 0 and 5, stock as a whole number, price greater
than zero, and whitespace-only input rejected. The JS layer also renders every
error inline next to its own field rather than one browser tooltip at a time.

The API has no create endpoint, so a saved product is appended to local
component state and flagged in the table rather than persisted.

### Image URLs

`image_url` values point at `example.com` and resolve to nothing. The task
notes this. The URL is displayed as text rather than rendered into an `<img>`
that would show a broken-image icon.

---

## Project structure

```
src/
  app/
    layout.js          shared shell and navigation
    page.js            home, two buttons
    products/page.js   server component, fetches and delegates
    carts/page.js      server component, fetches and delegates
  components/
    ProductsView.jsx   product table, detail row, add-form orchestration
    AddProductForm.jsx validated create form
    CartsView.jsx      cart table and joined detail view
    ApiError.jsx       upstream-failure state
  lib/
    api.js             fetching, joining, formatting
```
