import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ROLE_LABELS, todayAsDueDate } from "@/lib/domain";
import { INPUT_CLASS, SubmitButton } from "@/components/fields";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { changeOwnPassword, createTrainer, resetTrainerPassword, setTrainerActive } from "./actions";

const MESSAGES: Record<string, { text: string; tone: "ok" | "error" }> = {
  created: { text: "Trainer toegevoegd.", tone: "ok" },
  password: { text: "Wachtwoord gewijzigd.", tone: "ok" },
  invalid: { text: "Vul alle velden in; een wachtwoord heeft minimaal 8 tekens.", tone: "error" },
  exists: { text: "Er bestaat al een account met dit e-mailadres.", tone: "error" },
  current: { text: "Je huidige wachtwoord klopt niet.", tone: "error" },
};

export default async function TrainersPage({ searchParams }: PageProps<"/trainers">) {
  const user = await requireUser();
  const { ok, error } = await searchParams;
  const message = MESSAGES[String(error ?? ok ?? "")];
  const isAdmin = user.role === "ADMIN";

  const trainers = await prisma.user.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      _count: {
        select: {
          clients: { where: { client: { active: true } } },
          scheduledTasks: { where: { completed: false, dueDate: { lte: todayAsDueDate() } } },
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Trainers</h1>
        <p className="mt-1 text-sm text-slate-500">Accounts van trainers, met hun klanten en openstaande taken.</p>
      </div>

      {message && (
        <p
          className={`rounded-lg px-4 py-2 text-sm ${
            message.tone === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {trainers.map((t) => (
          <li
            key={t.id}
            className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${t.active ? "" : "opacity-60"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {t.name} {t.id === user.id && <span className="text-xs font-normal text-slate-400">(jij)</span>}
                </p>
                <p className="truncate text-xs text-slate-500">{t.email}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {t.active ? ROLE_LABELS[t.role] : "Inactief"}
              </span>
            </div>
            <div className="mt-3 flex gap-4 text-sm">
              <Link href={`/klanten?trainer=${t.id}&scope=alle`} className="text-emerald-700 hover:underline">
                {t._count.clients} klanten
              </Link>
              <Link href={`/?trainer=${t.id}&scope=alle`} className="text-slate-600 hover:underline">
                {t._count.scheduledTasks} taken vandaag
              </Link>
            </div>

            {isAdmin && t.id !== user.id && (
              <details className="mt-3 border-t border-slate-100 pt-2 text-sm">
                <summary className="cursor-pointer text-xs font-medium text-slate-500">Beheer</summary>
                <form action={resetTrainerPassword.bind(null, t.id)} className="mt-2 flex gap-2">
                  <input
                    name="password"
                    type="password"
                    minLength={8}
                    required
                    placeholder="Nieuw wachtwoord"
                    className={`${INPUT_CLASS} mt-0`}
                  />
                  <button type="submit" className="shrink-0 rounded-lg border border-slate-300 px-2 text-xs">
                    Instellen
                  </button>
                </form>
                <form action={setTrainerActive.bind(null, t.id, !t.active)} className="mt-2">
                  <ConfirmSubmitButton
                    confirmMessage={t.active ? `${t.name} deactiveren? Deze trainer kan dan niet meer inloggen.` : `${t.name} weer activeren?`}
                    className="text-xs text-red-600 hover:underline"
                  >
                    {t.active ? "Deactiveren" : "Activeren"}
                  </ConfirmSubmitButton>
                </form>
              </details>
            )}
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {isAdmin && (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Trainer toevoegen</h2>
            <form action={createTrainer} className="mt-4 space-y-3">
              <Input label="Naam" name="name" form="new" />
              <Input label="E-mail" name="email" type="email" form="new" />
              <Input label="Tijdelijk wachtwoord (min. 8 tekens)" name="password" type="password" form="new" />
              <div>
                <label htmlFor="new-role" className="block text-sm font-medium text-slate-700">
                  Rol
                </label>
                <select id="new-role" name="role" defaultValue="TRAINER" className={INPUT_CLASS}>
                  <option value="TRAINER">Trainer</option>
                  <option value="ADMIN">Beheerder (kan trainers beheren)</option>
                </select>
              </div>
              <SubmitButton label="Toevoegen" />
            </form>
          </section>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Mijn wachtwoord wijzigen</h2>
          <form action={changeOwnPassword} className="mt-4 space-y-3">
            <Input label="Huidig wachtwoord" name="current" type="password" form="own" />
            <Input label="Nieuw wachtwoord (min. 8 tekens)" name="password" type="password" form="own" />
            <SubmitButton label="Wijzigen" />
          </form>
        </section>
      </div>
    </div>
  );
}

function Input({ label, name, type = "text", form }: { label: string; name: string; type?: string; form: string }) {
  const id = `${form}-${name}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required
        minLength={type === "password" && name !== "current" ? 8 : undefined}
        className={INPUT_CLASS}
      />
    </div>
  );
}
