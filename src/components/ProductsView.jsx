"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/api";
import AddProductForm from "@/components/AddProductForm";
import { DetailField, PageHeader, TogglePill } from "@/components/ui";

/**
 * Products list with an expandable detail panel and an add-product form.
 *
 * `expandedId` holds the single open row rather than a per-row boolean. One
 * piece of state means only one detail panel can ever be open, and closing is
 * just setting it back to null.
 *
 * `addedProducts` keeps locally created products in component state. The task
 * specifies there is no backend for creation, so a new product is appended to
 * the rendered list and visually flagged rather than POSTed anywhere.
 */
export default function ProductsView({ products }) {
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [addedProducts, setAddedProducts] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const allProducts = [...products, ...addedProducts];
  // The API has no list of categories, so build one from the products: a Set
  // removes duplicates, then sort alphabetically. Feeds the header count and
  // the Add Product form's dropdown.
  const categories = [...new Set(allProducts.map((p) => p.category))].sort();
  const categoryCount = categories.length;

  function toggleRow(id) {
    setExpandedId((current) => (current === id ? null : id));
  }

  // Called by AddProductForm once its validation passes.
  function handleProductAdded(product) {
    setAddedProducts((current) => [...current, product]);
    setShowForm(false);
    setSuccessMessage(`"${product.name}" was added successfully.`);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        description={`${allProducts.length} products across ${categoryCount} categories. Select a row to see full detail.`}
        action={
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setSuccessMessage("");
            }}
            className="rounded-lg bg-brand-deep px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-ink"
          >
            Add Product
          </button>
        }
      />

      {successMessage && (
        <div
          role="status"
          className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          <span aria-hidden="true" className="mt-0.5 font-bold">
            &#10003;
          </span>
          <p className="flex-1">{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="font-medium text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
          >
            Dismiss
          </button>
        </div>
      )}

      {showForm && (
        <AddProductForm
          categories={categories}
          onCancel={() => setShowForm(false)}
          onSubmit={handleProductAdded}
        />
      )}

      {/* Desktop and tablet: a real table, the right semantics for comparing
          rows across columns. */}
      <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-line md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Product catalog</caption>
          <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold">Name</th>
              <th scope="col" className="px-4 py-3 font-bold">Category</th>
              <th scope="col" className="px-4 py-3 text-right font-bold">Price</th>
              <th scope="col" className="px-4 py-3 text-right font-bold">In stock</th>
              <th scope="col" className="w-12 px-4 py-3">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {allProducts.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                isOpen={expandedId === product.id}
                onToggle={() => toggleRow(product.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones: the same data as stacked cards. A five-column table does not
          fit a phone screen without scrolling sideways. */}
      <ul className="space-y-3 md:hidden">
        {allProducts.map((product) => {
          const isOpen = expandedId === product.id;
          return (
            <li key={product.id} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-line">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggleRow(product.id)}
                className="flex w-full items-start gap-3 p-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink">
                    {product.name}
                    {product.isLocal && <LocalBadge />}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold tabular-nums text-ink">{formatCurrency(product.price)}</p>
                  <p className="mt-0.5 text-xs text-muted">{product.stock} in stock</p>
                </div>
                <TogglePill open={isOpen} />
              </button>
              {isOpen && (
                <div className="border-t border-line bg-surface p-3">
                  <ProductDetail product={product} onClose={() => toggleRow(product.id)} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * One table row, plus the expanded detail row beneath it when open.
 * Returns a fragment (<>...</>) because a row and its detail are two <tr>s.
 */
function ProductRow({ product, isOpen, onToggle }) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer transition hover:bg-brand-soft/50 ${isOpen ? "bg-brand-soft/60" : ""}`}
      >
        <td className="px-4 py-3.5 font-medium text-ink">
          {product.name}
          {product.isLocal && <LocalBadge />}
        </td>
        <td className="px-4 py-3.5">
          <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-muted ring-1 ring-line">
            {product.category}
          </span>
        </td>
        <td className="px-4 py-3.5 text-right font-medium tabular-nums text-ink">
          {formatCurrency(product.price)}
        </td>
        <td className="px-4 py-3.5 text-right tabular-nums text-muted">{product.stock}</td>
        <td className="px-4 py-3.5 text-right">
          {/* The row is clickable for mouse users; this button is the keyboard
              and screen-reader path, with aria-expanded state. */}
          <button
            type="button"
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Hide" : "Show"} details for ${product.name}`}
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
        <tr className="bg-brand-soft/60">
          <td colSpan={5} className="px-4 pb-5 pt-1">
            <ProductDetail product={product} onClose={onToggle} />
          </td>
        </tr>
      )}
    </>
  );
}

/**
 * Every field of one product. Used in both the table's detail row and the
 * phone card, so the two layouts can never drift apart.
 */
function ProductDetail({ product, onClose }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-deep">{product.category}</p>
          <h2 className="mt-1 text-lg font-bold text-ink">{product.name}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto shrink-0 rounded-md border border-line px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-surface"
        >
          Close
        </button>
      </div>

      <p className="mb-5 max-w-2xl text-sm leading-relaxed text-muted">{product.description}</p>

      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Price" value={formatCurrency(product.price)} />
        <DetailField label="Category" value={product.category} />
        <DetailField label="Number in stock" value={product.stock} />
        <DetailField
          label="Rating"
          value={
            product.rating
              ? `${product.rating.rate} out of 5 (${product.rating.count} ratings)`
              : "Not rated"
          }
        />
        <DetailField label="SKU" value={<span className="font-mono text-xs">{product.sku}</span>} />
        <DetailField
          label="Image URL"
          value={<span className="break-all font-mono text-xs text-muted">{product.image_url}</span>}
        />
      </dl>
    </div>
  );
}

/** Marks a product added through the form this session (not from the API). */
function LocalBadge() {
  return (
    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-amber-800">
      New
    </span>
  );
}
