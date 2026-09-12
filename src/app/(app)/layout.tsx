import Link from "next/link";
import { logout } from "../login/actions";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="text-sm font-semibold text-slate-900">
            PT Studio Oldebroek
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>
            <Link href="/klanten" className="text-slate-600 hover:text-slate-900">
              Klanten
            </Link>
            <form action={logout}>
              <button type="submit" className="text-slate-400 hover:text-slate-700">
                Uitloggen
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
