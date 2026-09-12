import { toDateInputValue } from "@/lib/domain";
import TrainingAndIntervalFields from "@/components/TrainingAndIntervalFields";

export interface ClientFormValues {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  birthDate?: Date | string | null;
  contactIntervalWeeks?: number;
  ptSessionsPerWeek?: number | null;
  ptSessionMinutes?: number | null;
  notes?: string | null;
  active?: boolean;
}

export default function ClientForm({
  action,
  initial,
  submitLabel,
  showActiveToggle,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initial?: ClientFormValues;
  submitLabel: string;
  showActiveToggle?: boolean;
}) {
  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Voornaam" name="firstName" required defaultValue={initial?.firstName} />
        <Field label="Achternaam" name="lastName" required defaultValue={initial?.lastName} />
        <Field label="E-mail" name="email" type="email" defaultValue={initial?.email ?? ""} />
        <Field label="Telefoon" name="phone" defaultValue={initial?.phone ?? ""} />
        <Field
          label="Geboortedatum"
          name="birthDate"
          type="date"
          defaultValue={toDateInputValue(initial?.birthDate)}
        />
        <TrainingAndIntervalFields
          initialSessionsPerWeek={initial?.ptSessionsPerWeek}
          initialSessionMinutes={initial?.ptSessionMinutes}
          initialIntervalWeeks={initial?.contactIntervalWeeks}
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Notities
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={initial?.notes ?? ""}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      {showActiveToggle && (
        <div className="flex items-center gap-2">
          <input
            id="active"
            name="active"
            type="checkbox"
            defaultChecked={initial?.active ?? true}
            className="h-4 w-4 rounded border-slate-300"
          />
          <label htmlFor="active" className="text-sm text-slate-700">
            Actieve klant
          </label>
        </div>
      )}

      <button
        type="submit"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      />
    </div>
  );
}
