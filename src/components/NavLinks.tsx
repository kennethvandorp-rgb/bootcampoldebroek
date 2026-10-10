"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/klanten", label: "Klanten", icon: "👥" },
  { href: "/trainers", label: "Trainers", icon: "🏋️" },
];

export default function NavLinks({ className, mobile }: { className?: string; mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <div className={`${className ?? ""} items-center gap-1`}>
      {LINKS.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return mobile ? (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
              active ? "font-semibold text-emerald-700" : "text-slate-500"
            }`}
          >
            <span aria-hidden className="text-lg">
              {link.icon}
            </span>
            {link.label}
          </Link>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              active ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
