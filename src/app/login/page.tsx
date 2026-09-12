import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from, error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">PT Studio Oldebroek</h1>
        <p className="mt-1 text-sm text-slate-500">Log in om het klantvolgsysteem te openen.</p>

        <form action={login} className="mt-6 space-y-4">
          <input type="hidden" name="from" value={from ?? "/"} />
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Wachtwoord
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">Onjuist wachtwoord, probeer het opnieuw.</p>}

          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Inloggen
          </button>
        </form>
      </div>
    </div>
  );
}
