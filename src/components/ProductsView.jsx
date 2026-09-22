"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/api";
import AddProductForm from "@/components/AddProductForm";

/**
 * Products list with an expandable detail row and an add-product form.
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

  function toggleRow(id) {
    setExpandedId((current) => (current === id ? null : id));
  }

  function handleProductAdded(product) {
    setAddedProducts((current) => [...current, product]);
    setShowForm(false);
    setSuccessMessage(`"${product.name}" was added successfully.`);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-slate-600">
            {allProducts.length} products. Select a row to see full detail.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setSuccessMessage("");
          }}
          className="ml-auto rounded-lg bg-[var(--rr-navy)] px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          Add Product
        </button>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          <span aria-hidden="true" className="mt-0.5 font-semibold">✓</span>
          <p className="flex-1">{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {showForm && (
        <AddProductForm
          onCancel={() => setShowForm(false)}
          onSubmit={handleProductAdded}
        />
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Product catalog</caption>
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Name</th>
              <th scope="col" className="px-4 py-3 font-medium">Category</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Price</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">In stock</th>
              <th scope="col" className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allProducts.map((product) => {
              const isOpen = expandedId === product.id;
              return (
                <ProductRow
                  key={product.id}
                  product={product}
                  isOpen={isOpen}
                  onToggle={() => toggleRow(product.id)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductRow({ product, isOpen, onToggle }) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer transition hover:bg-slate-50 ${
          isOpen ? "bg-slate-50" : ""
        }`}
      >
        <td className="px-4 py-3 font-medium text-slate-900">
          {product.name}
          {product.isLocal && (
            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
              Added locally
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-slate-600">{product.category}</td>
        <td className="px-4 py-3 text-right tabular-nums text-slate-900">
          {formatCurrency(product.price)}
        </td>
        <td className="px-4 py-3 text-right tabular-nums text-slate-600">
          {product.stock}
        </td>
        <td className="px-4 py-3 text-right">
          <button
            type="button"
            aria-expanded={isOpen}
            aria-label={
              isOpen ? `Collapse ${product.name}` : `Expand ${product.name}`
            }
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
            <ProductDetail product={product} onClose={onToggle} />
          </td>
        </tr>
      )}
    </>
  );
}

function ProductDetail({ product, onClose }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {product.name}
          </h2>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-500">
            SKU {product.sku}
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

      <p className="mb-5 max-w-2xl text-sm leading-relaxed text-slate-700">
        {product.description}
      </p>

      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Price" value={formatCurrency(product.price)} />
        <Field label="Category" value={product.category} />
        <Field label="Number in stock" value={product.stock} />
        <Field
          label="Rating"
          value={
            product.rating
              ? `${product.rating.rate} out of 5 (${product.rating.count} ratings)`
              : "Not rated"
          }
        />
        <Field label="SKU" value={product.sku} />
        <Field
          label="Image URL"
          value={
            <span className="break-all font-mono text-xs text-slate-600">
              {product.image_url}
            </span>
          }
        />
      </dl>

      <p className="mt-5 border-t border-slate-100 pt-3 text-xs text-slate-500">
        Image URLs in this dataset point at example.com and resolve to nothing,
        so the URL is shown as text rather than rendered as a broken image.
      </p>
    </div>
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
