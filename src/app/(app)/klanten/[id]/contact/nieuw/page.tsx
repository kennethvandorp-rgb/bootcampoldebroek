import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getActiveTrainers } from "@/lib/queries";
import FormCard from "@/components/FormCard";
import { TextField, TextAreaField, SelectField, SubmitButton } from "@/components/fields";
import { CONTACT_TYPES, CONTACT_TYPE_ICONS, CONTACT_TYPE_LABELS, toDateTimeInputValue } from "@/lib/domain";
import { createContactMoment } from "../../actions";

export default async function NewContactMomentPage({ params, searchParams }: PageProps<"/klanten/[id]/contact/nieuw">) {
  const { id } = await params;
  const { type } = await searchParams;
  const user = await requireUser();
  const [client, trainers] = await Promise.all([
    prisma.client.findUnique({ where: { id }, select: { firstName: true, lastName: true } }),
    getActiveTrainers(),
  ]);
  if (!client) notFound();

  const defaultType = typeof type === "string" && CONTACT_TYPES.includes(type as never) ? type : "WHATSAPP";

  return (
    <FormCard
      title="Contactmoment loggen"
      description={`Leg vast wanneer en hoe er contact was met ${client.firstName} ${client.lastName}.`}
      backHref={`/klanten/${id}`}
    >
      <form action={createContactMoment.bind(null, id)} className="space-y-4">
        <fieldset>
          <legend className="block text-sm font-medium text-slate-700">Type contact</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CONTACT_TYPES.map((t) => (
              <label
                key={t}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50"
              >
                <input type="radio" name="type" value={t} defaultChecked={t === defaultType} className="sr-only" />
                <span aria-hidden>{CONTACT_TYPE_ICONS[t]}</span>
                {CONTACT_TYPE_LABELS[t]}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Datum en tijd" name="date" type="datetime-local" required defaultValue={toDateTimeInputValue()} />
          <SelectField
            label="Uitvoerende trainer"
            name="trainerId"
            defaultValue={user.id}
            options={trainers.map((t) => ({ value: t.id, label: t.name }))}
          />
        </div>
        <TextAreaField
          label="Notitie / inhoud van het gesprek"
          name="notes"
          rows={4}
          placeholder="Bijv. voortgang besproken, spierpijn na beentraining valt mee"
        />
        <SubmitButton label="Opslaan" />
      </form>
    </FormCard>
  );
}
