import { toDateInputValue } from "@/lib/domain";
import { TrainerCheckboxes, INPUT_CLASS } from "@/components/fields";

export interface ClientFormValues {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  birthDate?: Date | string | null;
  ptSessionsPerWeek?: number | null;
  ptSessionMinutes?: number | null;
  notes?: string | null;
  active?: boolean;
}

export default function ClientForm({
  action,
  initial,
  trainers,
  selectedTrainerIds,
  submitLabel,
  showActiveToggle,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initial?: ClientFormValues;
  trainers: { id: string; name: string }[];
  selectedTrainerIds: string[];
  submitLabel: string;
  showActiveToggle?: boolean;
}) {
  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Voornaam" name="firstName" required defaultValue={initial?.firstName} />
        <Field label="Achternaam" name="lastName" required defaultValue={initial?.lastName} />
        <Field label="E-mail" name="email" type="email" defaultValue={initial?.email ?? ""} />
        <Field label="Telefoon" name="phone" type="tel" defaultValue={initial?.phone ?? ""} />
        <Field
          label="Geboortedatum"
          name="birthDate"
          type="date"
          defaultValue={toDateInputValue(initial?.birthDate)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="PT-sessies/week"
            name="ptSessionsPerWeek"
            type="number"
            defaultValue={initial?.ptSessionsPerWeek?.toString() ?? ""}
          />
          <Field
            label="Min. per sessie"
            name="ptSessionMinutes"
            type="number"
            defaultValue={initial?.ptSessionMinutes?.toString() ?? ""}
          />
        </div>
      </div>

      <TrainerCheckboxes trainers={trainers} selected={selectedTrainerIds} />

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Notities
        </label>
        <textarea id="notes" name="notes" rows={3} defaultValue={initial?.notes ?? ""} className={INPUT_CLASS} />
      </div>

      {showActiveToggle && (
        <div className="flex items-center gap-2">
          <input
            id="active"
            name="active"
            type="checkbox"
            defaultChecked={initial?.active ?? true}
            className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
          />
          <label htmlFor="active" className="text-sm text-slate-700">
            Actieve klant
          </label>
        </div>
      )}

      <button
        type="submit"
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
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
        min={type === "number" ? 0 : undefined}
        defaultValue={defaultValue}
        className={INPUT_CLASS}
      />
    </div>
  );
}
