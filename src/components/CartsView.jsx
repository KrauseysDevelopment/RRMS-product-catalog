"use client";

import { useState } from "react";
import { cartUserLabel, formatDate } from "@/lib/api";

/**
 * Carts list with an expandable detail row.
 *
 * Everything rendered here was assembled in lib/api.js. By the time a cart
 * reaches this component it already carries its resolved `user` object, its
 * `lineItems` with full product records attached, and a `userStatus` flag. The
 * component's only job is presentation, which keeps the join logic in one
 * testable place instead of scattered through JSX.
 */
export default function CartsView({ carts }) {
  const [expandedId, setExpandedId] = useState(null);

  const unresolved = carts.filter((c) => c.userStatus !== "ok").length;

  function toggleRow(id) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Carts</h1>
        <p className="mt-1 text-sm text-slate-600">
          {carts.length} carts. Select a row to see the customer and line items.
        </p>
      </div>

      {unresolved > 0 && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong className="font-semibold">Note on the source data:</strong>{" "}
          {unresolved} of {carts.length} carts reference a user that does not
          exist in the users endpoint, or no user at all. Those rows are
          labelled rather than left blank.
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Shopping carts</caption>
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Customer</th>
              <th scope="col" className="px-4 py-3 font-medium">Date</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Items</th>
              <th scope="col" className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {carts.map((cart) => {
              const isOpen = expandedId === cart.id;
              return (
                <CartRow
                  key={cart.id}
                  cart={cart}
                  isOpen={isOpen}
                  onToggle={() => toggleRow(cart.id)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CartRow({ cart, isOpen, onToggle }) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer transition hover:bg-slate-50 ${
          isOpen ? "bg-slate-50" : ""
        }`}
      >
        <td className="px-4 py-3 font-medium text-slate-900">
          {cartUserLabel(cart)}
          {cart.userStatus !== "ok" && (
            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
              {cart.userStatus === "guest" ? "No account" : "Unresolved"}
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-slate-600">{formatDate(cart.date)}</td>
        <td className="px-4 py-3">
          <StatusBadge status={cart.status} />
        </td>
        <td className="px-4 py-3 text-right tabular-nums text-slate-600">
          {cart.itemCount}
        </td>
        <td className="px-4 py-3 text-right">
          <button
            type="button"
            aria-expanded={isOpen}
            aria-label={isOpen ? `Collapse cart ${cart.id}` : `Expand cart ${cart.id}`}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
          </button>
        </td>
      </tr>

      {isOpen && (
        <tr className="bg-slate-50">
          <td colSpan={5} className="px-4 pb-5 pt-1">
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
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-start">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Cart {cart.id}
          </h2>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-500">
            {formatDate(cart.date)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Close
        </button>
      </div>

      <section className="mb-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Customer
        </h3>
        {user ? (
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Name" value={`${user.firstname} ${user.lastname}`} />
            <Field label="Email" value={user.email} />
            <Field label="Phone" value={user.phone} />
            <Field
              label="Location"
              value={`${user.city}, ${user.state} ${user.zipcode}`}
            />
          </dl>
        ) : (
          <p className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {cart.userStatus === "guest"
              ? "This cart has no userId, so there is no customer record to display."
              : `This cart references user ID ${cart.userId}, which does not exist in the users endpoint. Contact details are unavailable.`}
          </p>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Items ({cart.itemCount})
        </h3>
        <ul className="divide-y divide-slate-100 rounded-md border border-slate-200">
          {cart.lineItems.map((line, index) => (
            <li key={`${line.productId}-${index}`} className="flex gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                {line.resolved ? (
                  <>
                    <p className="text-sm font-medium text-slate-900">
                      {line.product.name}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                      {line.product.description}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-amber-800">
                    Product ID {line.productId} is not present in the products
                    endpoint.
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Qty
                </p>
                <p className="text-sm font-medium tabular-nums text-slate-900">
                  {line.quantity}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StatusBadge({ status }) {
  const tone =
    {
      Completed: "bg-emerald-100 text-emerald-800",
      Pending: "bg-blue-100 text-blue-800",
      Abandoned: "bg-slate-200 text-slate-700",
    }[status] ?? "bg-slate-100 text-slate-700";

  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${tone}`}>
      {status}
    </span>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{value}</dd>
    </div>
  );
}
