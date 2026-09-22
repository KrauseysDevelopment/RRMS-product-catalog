"use client";

import { useState } from "react";

/**
 * Add Product form.
 *
 * The task requires every field to be mandatory and a success message on save.
 * There is no create endpoint, so this exists to demonstrate validation.
 *
 * Validation runs in two layers on purpose:
 *
 *   1. Native HTML constraints (`required`, `type="number"`, `min`, `step`).
 *      These give screen readers and the browser's own tooling the right
 *      semantics for free.
 *
 *   2. An explicit validate() pass in JS. Native constraints cannot express
 *      the domain rules this data actually has: rating must fall between 0
 *      and 5, stock must be a whole number, price must be greater than zero,
 *      and a field of only spaces is not a real value. This layer also lets
 *      every error render inline next to its own field instead of one browser
 *      tooltip at a time.
 *
 * `noValidate` on the form hands control to layer 2 so the two do not compete
 * over which message the user sees first.
 */

const EMPTY_FORM = {
  name: "",
  price: "",
  category: "",
  description: "",
  stock: "",
  sku: "",
  image_url: "",
  ratingRate: "",
  ratingCount: "",
};

export default function AddProductForm({ onSubmit, onCancel }) {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    // Clear a field's error as soon as the user edits it, so the form stops
    // scolding them about something they are actively fixing.
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function validate(input) {
    const found = {};
    const required = (field, label) => {
      if (!String(input[field]).trim()) found[field] = `${label} is required.`;
    };

    required("name", "Name");
    required("category", "Category");
    required("description", "Description");
    required("sku", "SKU");
    required("image_url", "Image URL");
    required("price", "Price");
    required("stock", "Number in stock");
    required("ratingRate", "Rating");
    required("ratingCount", "Rating count");

    const price = Number(input.price);
    if (input.price && (!Number.isFinite(price) || price <= 0)) {
      found.price = "Price must be a number greater than zero.";
    }

    const stock = Number(input.stock);
    if (input.stock && (!Number.isInteger(stock) || stock < 0)) {
      found.stock = "Stock must be a whole number of zero or more.";
    }

    const rate = Number(input.ratingRate);
    if (input.ratingRate && (!Number.isFinite(rate) || rate < 0 || rate > 5)) {
      found.ratingRate = "Rating must be between 0 and 5.";
    }

    const count = Number(input.ratingCount);
    if (input.ratingCount && (!Number.isInteger(count) || count < 0)) {
      found.ratingCount = "Rating count must be a whole number of zero or more.";
    }

    return found;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Shaped to match the API's product schema so it renders through exactly
    // the same components as a fetched product, with a local flag so the UI
    // can be honest that this one was never persisted.
    onSubmit({
      id: `local-${Date.now()}`,
      name: values.name.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      category: values.category.trim(),
      stock: Number(values.stock),
      sku: values.sku.trim(),
      image_url: values.image_url.trim(),
      rating: { rate: Number(values.ratingRate), count: Number(values.ratingCount) },
      isLocal: true,
    });
    setValues(EMPTY_FORM);
  }

  const errorCount = Object.keys(errors).length;

  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center">
        <h2 className="text-base font-semibold text-slate-900">
          Add a new product
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="ml-auto rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>

      {errorCount > 0 && (
        <div
          role="alert"
          className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          Please correct {errorCount} {errorCount === 1 ? "field" : "fields"}{" "}
          below.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="name" label="Name" value={values.name} error={errors.name}
          onChange={(v) => setField("name", v)}
        />
        <TextField
          id="category" label="Category" value={values.category} error={errors.category}
          onChange={(v) => setField("category", v)}
        />
        <TextField
          id="price" label="Price (USD)" type="number" step="0.01" min="0.01"
          value={values.price} error={errors.price}
          onChange={(v) => setField("price", v)}
        />
        <TextField
          id="stock" label="Number in stock" type="number" step="1" min="0"
          value={values.stock} error={errors.stock}
          onChange={(v) => setField("stock", v)}
        />
        <TextField
          id="sku" label="SKU" value={values.sku} error={errors.sku}
          onChange={(v) => setField("sku", v)}
        />
        <TextField
          id="image_url" label="Image URL" value={values.image_url} error={errors.image_url}
          onChange={(v) => setField("image_url", v)}
        />
        <TextField
          id="ratingRate" label="Rating (0-5)" type="number" step="0.1" min="0" max="5"
          value={values.ratingRate} error={errors.ratingRate}
          onChange={(v) => setField("ratingRate", v)}
        />
        <TextField
          id="ratingCount" label="Number of ratings" type="number" step="1" min="0"
          value={values.ratingCount} error={errors.ratingCount}
          onChange={(v) => setField("ratingCount", v)}
        />

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            Description <span className="text-red-600">*</span>
          </label>
          <textarea
            id="description"
            rows={3}
            required
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? "description-error" : undefined}
            className={`mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
              errors.description ? "border-red-400 bg-red-50" : "border-slate-300"
            }`}
          />
          {errors.description && (
            <p id="description-error" className="mt-1 text-xs text-red-700">
              {errors.description}
            </p>
          )}
        </div>

        <div className="flex gap-3 sm:col-span-2">
          <button
            type="submit"
            className="rounded-lg bg-[var(--rr-navy)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            Save Product
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </form>

      <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
        The API has no create endpoint, so a saved product is held in local
        component state and flagged in the table rather than persisted.
      </p>
    </div>
  );
}

function TextField({ id, label, value, error, onChange, type = "text", ...rest }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label} <span className="text-red-600">*</span>
      </label>
      <input
        id={id}
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
          error ? "border-red-400 bg-red-50" : "border-slate-300"
        }`}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
