"use client";

import { useState } from "react";
import { cartUserLabel, formatCurrency } from "@/lib/api";
import { DetailField, PageHeader, StatusBadge, TogglePill } from "@/components/ui";

/**
 * Carts list with an expandable detail panel.
 *
 * Everything rendered here was assembled in lib/api.js. By the time a cart
 * reaches this component it already carries its resolved `user`, `lineItems`
 * with products and line totals attached, a `subtotal`, a `userStatus` flag
 * and a server-formatted `displayDate`. This component only presents it,
 * which keeps the join in one tested place instead of scattered through JSX.
 */

export default function CartsView({ carts }) {
  const [expandedId, setExpandedId] = useState(null);

  const unresolved = carts.filter((c) => c.userStatus !== "ok").length;

  function toggle(id) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <div>
      <PageHeader
        eyebrow="Orders"
        title="Carts"
        description={`${carts.length} carts. Select a row to see the customer, items and totals.`}
      />

      {unresolved > 0 && (
        <div className="mb-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span aria-hidden="true" className="font-black">!</span>
          <p>
            <strong className="font-bold">
              {unresolved} of {carts.length} carts need review.
            </strong>{" "}
            They are not linked to a customer on file, either because they are
            guest checkouts or because the customer record is missing. They are
            flagged below.
          </p>
        </div>
      )}

      {/* Desktop and tablet */}
      <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-line md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Shopping carts</caption>
          <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold">Customer</th>
              <th scope="col" className="px-4 py-3 font-bold">Date</th>
              <th scope="col" className="px-4 py-3 font-bold">Status</th>
              <th scope="col" className="px-4 py-3 text-right font-bold">Items</th>
              <th scope="col" className="px-4 py-3 text-right font-bold">Total</th>
              <th scope="col" className="w-12 px-4 py-3">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {carts.map((cart) => (
              <CartRow key={cart.id} cart={cart} isOpen={expandedId === cart.id} onToggle={() => toggle(cart.id)} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones */}
      <ul className="space-y-3 md:hidden">
        {carts.map((cart) => {
          const isOpen = expandedId === cart.id;
          return (
            <li key={cart.id} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-line">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`cart-card-${cart.id}`}
                onClick={() => toggle(cart.id)}
                className="flex w-full items-start gap-3 p-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink">{cartUserLabel(cart)}</p>
                  <p className="mt-0.5 text-xs text-muted">{cart.displayDate}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={cart.status} />
                    <UserFlag cart={cart} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold tabular-nums text-ink">{formatCurrency(cart.subtotal)}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
                  </p>
                </div>
                <TogglePill open={isOpen} />
              </button>
              {isOpen && (
                <div id={`cart-card-${cart.id}`} className="border-t border-line bg-surface p-3">
                  <CartDetail cart={cart} onClose={() => toggle(cart.id)} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function UserFlag({ cart }) {
  if (cart.userStatus === "ok") return null;
  return (
    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
      {cart.userStatus === "guest" ? "Guest" : "Not on file"}
    </span>
  );
}

function CartRow({ cart, isOpen, onToggle }) {
  const detailId = `cart-detail-${cart.id}`;
  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer transition hover:bg-brand-soft/50 ${isOpen ? "bg-brand-soft/60" : ""}`}
      >
        <td className="px-4 py-3.5 font-medium text-ink">
          <span className="mr-2">{cartUserLabel(cart)}</span>
          <UserFlag cart={cart} />
        </td>
        <td className="px-4 py-3.5 text-muted">{cart.displayDate}</td>
        <td className="px-4 py-3.5">
          <StatusBadge status={cart.status} />
        </td>
        <td className="px-4 py-3.5 text-right tabular-nums text-muted">{cart.itemCount}</td>
        <td className="px-4 py-3.5 text-right font-medium tabular-nums text-ink">
          {formatCurrency(cart.subtotal)}
        </td>
        <td className="px-4 py-3.5 text-right">
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={isOpen ? detailId : undefined}
            aria-label={`${isOpen ? "Hide" : "Show"} details for cart ${cart.id}`}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            className="rounded-md p-1"
          >
            <TogglePill open={isOpen} />
          </button>
        </td>
      </tr>

      {isOpen && (
        <tr id={detailId} className="bg-brand-soft/60">
          <td colSpan={6} className="px-4 pb-5 pt-1">
            <CartDetail cart={cart} onClose={onToggle} />
          </td>
        </tr>
      )}
    </>
  );
}

function CartDetail({ cart, onClose }) {
  const { user } = cart;

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-deep">Cart {cart.id}</p>
          <h2 className="mt-1 text-lg font-bold text-ink">{cartUserLabel(cart)}</h2>
          <p className="mt-0.5 text-xs text-muted">{cart.displayDate}</p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <span className="hidden sm:inline-flex">
            <StatusBadge status={cart.status} />
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-line px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-surface"
          >
            Close
          </button>
        </div>
      </div>

      <section className="mb-6">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Customer</h3>
        {user ? (
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            <DetailField label="Name" value={`${user.firstname} ${user.lastname}`} />
            <DetailField
              label="Email"
              value={
                <a href={`mailto:${user.email}`} className="text-brand-deep hover:underline">
                  {user.email}
                </a>
              }
            />
            <DetailField label="Phone" value={user.phone} />
            <DetailField label="Location" value={`${user.city}, ${user.state} ${user.zipcode}`} />
          </dl>
        ) : (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {cart.userStatus === "guest"
              ? "This is a guest checkout, so there is no customer record to display."
              : `This cart belongs to customer #${cart.userId}, who is not on file. Contact details are unavailable.`}
          </p>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
          Items ({cart.itemCount})
        </h3>
        <div className="overflow-hidden rounded-lg border border-line">
          <ul className="divide-y divide-line">
            {cart.lineItems.map((line, index) => (
              <li key={`${line.productId}-${index}`} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:gap-6">
                <div className="min-w-0 flex-1">
                  {line.resolved ? (
                    <>
                      <p className="text-sm font-bold text-ink">{line.product.name}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted">{line.product.description}</p>
                    </>
                  ) : (
                    <p className="text-sm text-amber-800">
                      Product #{line.productId} is no longer in the catalog.
                    </p>
                  )}
                </div>
                <dl className="grid shrink-0 grid-cols-3 gap-4 text-right sm:w-64">
                  <LineFigure label="Qty" value={line.quantity} />
                  <LineFigure label="Unit" value={line.resolved ? formatCurrency(line.unitPrice) : "n/a"} />
                  <LineFigure label="Total" value={line.resolved ? formatCurrency(line.lineTotal) : "n/a"} strong />
                </dl>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-line bg-surface px-4 py-3 text-sm">
            <span className="font-bold uppercase tracking-wide text-muted">Subtotal</span>
            <span className="text-base font-black tabular-nums text-ink">{formatCurrency(cart.subtotal)}</span>
          </div>
        </div>
        {cart.lineItems.some((line) => !line.resolved) && (
          <p className="mt-2 text-xs text-amber-800">
            The subtotal excludes lines whose product could not be found.
          </p>
        )}
      </section>
    </div>
  );
}

function LineFigure({ label, value, strong }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</dt>
      <dd className={`mt-0.5 text-sm tabular-nums ${strong ? "font-bold text-ink" : "text-ink"}`}>{value}</dd>
    </div>
  );
}
