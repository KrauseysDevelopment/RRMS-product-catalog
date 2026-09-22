import "./globals.css";

export const metadata = {
  title: "RRMS Product Catalog",
  description:
    "Rapid Response Monitoring Services SE development task: consuming the JSONing public API in Next.js.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
            <span
              aria-hidden="true"
              className="h-6 w-1.5 rounded-full bg-[var(--rr-red)]"
            />
            <a href="/" className="text-lg font-semibold tracking-tight">
              RRMS Catalog
            </a>
            <nav className="ml-auto flex gap-1 text-sm">
              <a
                href="/products"
                className="rounded px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Products
              </a>
              <a
                href="/carts"
                className="rounded px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Carts
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-slate-500">
          Data from the JSONing public mock API. Built for the RRMS SE
          development task.
        </footer>
      </body>
    </html>
  );
}
