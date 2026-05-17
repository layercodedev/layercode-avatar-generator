"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Generate", icon: "M12 4v16m8-8H4" },
    { href: "/history", label: "History", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  return (
    <nav className="aqua-toolbar">
      <div className="aqua-segmented">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`aqua-segmented-item flex items-center gap-2 ${
              pathname === link.href ? "active" : ""
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
            </svg>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
