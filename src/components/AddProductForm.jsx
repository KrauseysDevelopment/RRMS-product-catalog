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

// Sentinel value for the "New category" option in the category dropdown.
const NEW_CATEGORY = "__new__";

const EMPTY_FORM = {
  name: "",
  price: "",
  category: "",
  newCategory: "",
  description: "",
  stock: "",
  sku: "",
  image_url: "",
  ratingRate: "",
  ratingCount: "",
};

/**
 * `categories` is the list of categories already in the catalog. The API has
 * no categories resource: category is a plain text field on each product. So
 * the list is derived from the products themselves, and offered as a
 * dropdown to keep new products consistent with existing ones ("Accessories",
 * not "accessory"). "New category" is still available for a genuinely new one.
 */
export default function AddProductForm({ onSubmit, onCancel, categories = [] }) {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    // Clear a field's error as soon as the user edits it, so the form stops
    // scolding them about something they are actively fixing.
    // Changing the category also clears the "new category" error, since that
    // field disappears when an existing category is picked.
    const cleared = field === "category" ? [field, "newCategory"] : [field];
    setErrors((current) => {
      if (!cleared.some((f) => current[f])) return current;
      const next = { ...current };
      cleared.forEach((f) => delete next[f]);
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
    if (input.category === NEW_CATEGORY && !input.newCategory.trim()) {
      found.newCategory = "Enter a name for the new category.";
    }
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

    // A "new" category that matches an existing one apart from case is
    // treated as the existing one, so the catalog never ends up with both
    // "Audio" and "audio".
    let category = values.category;
    if (category === NEW_CATEGORY) {
      const typed = values.newCategory.trim();
      category =
        categories.find((c) => c.toLowerCase() === typed.toLowerCase()) ?? typed;
    }

    // Shaped to match the API's product schema so it renders through exactly
    // the same components as a fetched product, with a local flag so the UI
    // can be honest that this one was never persisted.
    onSubmit({
      id: `local-${Date.now()}`,
      name: values.name.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      category,
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
    <div className="mb-6 rounded-xl border-t-4 border-brand bg-white p-5 shadow-sm ring-1 ring-line sm:p-6">
      <div className="mb-4 flex items-center">
        <div>
          <h2 className="text-lg font-bold text-ink">Add a new product</h2>
          <p className="mt-0.5 text-xs text-muted">All fields are required.</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="ml-auto rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface"
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
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-ink">
            Category <span className="text-red-600">*</span>
          </label>
          {/* appearance-none drops the browser's native select styling, which
              ignores padding on macOS, so the dropdown matches the inputs. The
              chevron is drawn separately. */}
          <div className="relative mt-1">
            <select
              id="category"
              required
              value={values.category}
              onChange={(e) => setField("category", e.target.value)}
              aria-invalid={Boolean(errors.category)}
              aria-describedby={errors.category ? "category-error" : undefined}
              className={`w-full appearance-none rounded-md border py-2 pl-3 pr-9 text-sm shadow-sm ${
                errors.category ? "border-red-400 bg-red-50" : "border-line bg-white"
              } ${values.category ? "text-ink" : "text-muted"}`}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={NEW_CATEGORY}>New category...</option>
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            >
              <path
                fill="currentColor"
                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              />
            </svg>
          </div>
          {errors.category && (
            <p id="category-error" className="mt-1 text-xs text-red-700">
              {errors.category}
            </p>
          )}
          {values.category === NEW_CATEGORY && (
            <div className="mt-2">
              <TextField
                id="newCategory" label="New category name" value={values.newCategory}
                error={errors.newCategory} onChange={(v) => setField("newCategory", v)}
              />
            </div>
          )}
        </div>
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
          <label htmlFor="description" className="block text-sm font-medium text-ink">
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
            className={`mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm ${
              errors.description ? "border-red-400 bg-red-50" : "border-line"
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
            className="rounded-lg bg-brand-deep px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-ink"
          >
            Save Product
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-line px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-surface"
          >
            Cancel
          </button>
        </div>
      </form>

    </div>
  );
}

function TextField({ id, label, value, error, onChange, type = "text", ...rest }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
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
        className={`mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm ${
          error ? "border-red-400 bg-red-50" : "border-line"
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
