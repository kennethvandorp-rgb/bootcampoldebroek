import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { login, setupFirstAdmin } from "./actions";

const INPUT =
  "mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from, error } = await searchParams;

  if (await getCurrentUser()) redirect("/");
  const needsSetup = (await prisma.user.count()) === 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
            PT
          </span>
          <h1 className="text-lg font-semibold text-slate-900">PT Studio Oldebroek</h1>
        </div>

        {needsSetup ? (
          <>
            <p className="mt-4 text-sm text-slate-600">
              Welkom! Er zijn nog geen accounts. Maak het eerste beheerdersaccount aan; daarna kun je andere
              trainers toevoegen.
            </p>
            <form action={setupFirstAdmin} className="mt-6 space-y-4">
              <Field label="Naam" name="name" autoFocus />
              <Field label="E-mail" name="email" type="email" />
              <Field label="Wachtwoord (min. 8 tekens)" name="password" type="password" minLength={8} />
              {error === "setup" && <p className="text-sm text-red-600">Vul alle velden in (wachtwoord min. 8 tekens).</p>}
              <SubmitButton label="Account aanmaken" />
            </form>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm text-slate-500">Log in met je traineraccount.</p>
            <form action={login} className="mt-6 space-y-4">
              <input type="hidden" name="from" value={from ?? "/"} />
              <Field label="E-mail" name="email" type="email" autoFocus />
              <Field label="Wachtwoord" name="password" type="password" />
              {error && <p className="text-sm text-red-600">Onjuiste e-mail of wachtwoord.</p>}
              <SubmitButton label="Inloggen" />
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoFocus,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  autoFocus?: boolean;
  minLength?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        autoFocus={autoFocus}
        minLength={minLength}
        autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : undefined}
        className={INPUT}
      />
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
    >
      {label}
    </button>
  );
}
