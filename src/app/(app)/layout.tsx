import Link from "next/link";
import { logout } from "../login/actions";
import { requireUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/domain";
import NavLinks from "@/components/NavLinks";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
              PT
            </span>
            <span className="hidden text-sm font-semibold text-slate-900 sm:inline">PT Studio Oldebroek</span>
          </Link>
          <NavLinks className="hidden sm:flex" />
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-right leading-tight md:block">
              <span className="block font-medium text-slate-800">{user.name}</span>
              <span className="block text-xs text-slate-400">{ROLE_LABELS[user.role]}</span>
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 md:hidden">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <form action={logout}>
              <button type="submit" className="text-slate-400 hover:text-slate-700">
                Uitloggen
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 sm:px-6 sm:pb-10">{children}</main>
      {/* Navigatie onderin op mobiel */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white sm:hidden">
        <NavLinks className="flex justify-around" mobile />
      </nav>
    </div>
  );
}
