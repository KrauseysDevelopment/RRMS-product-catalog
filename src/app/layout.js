import localFont from "next/font/local";
import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import "./globals.css";

// Roboto, the typeface rrms.com uses, self-hosted from the repo as a single
// variable font file (SIL Open Font License, see src/fonts/OFL.txt).
//
// next/font/google would also work, but it downloads from Google at build
// time. Keeping the file in the repo means the build has no third-party
// dependency at all, the same reasoning as rendering pages per request.
// next/font still generates a size-adjusted fallback, so text does not
// shift when the font finishes loading.
const roboto = localFont({
  src: "../fonts/Roboto-Variable-latin.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-roboto",
  display: "swap",
});

export const metadata = {
  title: "RRMS Product Catalog",
  description:
    "A Next.js take-home for Rapid Response Monitoring Services: products and carts from the JSONing public API, joined and validated.",
};

export const viewport = {
  themeColor: "#1b75bc",
};

const REPO_URL = "https://github.com/KrauseysDevelopment/RRMS-product-catalog";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className="flex min-h-screen flex-col bg-surface font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:shadow"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <Link href="/" className="group flex items-center gap-3" aria-label="RRMS Product Catalog, home">
              <span
                aria-hidden="true"
                className="h-7 w-2 -skew-x-12 rounded-sm bg-gradient-to-b from-brand to-brand-deep"
              />
              <span className="flex items-baseline gap-2">
                <span className="text-lg font-black tracking-tight text-brand-deep">RRMS</span>
                <span className="hidden text-sm font-medium text-muted sm:inline">
                  Product Catalog
                </span>
              </span>
            </Link>
            <NavLinks />
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-line bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center">
            <p className="max-w-2xl leading-relaxed">
              Take-home project by Nicholas Krause for the Rapid Response
              Monitoring Services Software Engineer role. Not affiliated with or
              endorsed by RRMS. Data from the JSONing public mock API.
            </p>
            <div className="flex gap-4 sm:ml-auto">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand-deep hover:underline"
              >
                Source on GitHub
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
