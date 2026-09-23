"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/products", label: "Products" },
  { href: "/carts", label: "Carts" },
];

/**
 * Primary navigation. A client component only because it reads the current
 * path to mark the active link, both visually and with aria-current for
 * screen readers.
 */
export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="ml-auto flex gap-1 text-sm">
      {LINKS.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative rounded-md px-3 py-2 font-medium transition ${
              active
                ? "text-brand-deep"
                : "text-muted hover:bg-surface hover:text-ink"
            }`}
          >
            {label}
            {active && (
              <span
                aria-hidden="true"
                className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-brand"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
