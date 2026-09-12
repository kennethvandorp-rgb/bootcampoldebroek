import FormCard from "@/components/FormCard";
import { TextField, TextAreaField, SelectField, SubmitButton } from "@/components/fields";
import { CONTACT_TYPE_LABELS } from "@/lib/domain";
import { createContactMoment } from "../../actions";

export default async function NewContactMomentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <FormCard
      title="Nieuw contactmoment"
      description="Leg vast wanneer en hoe je contact had met deze klant."
      backHref={`/klanten/${id}`}
    >
      <form action={createContactMoment.bind(null, id)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="Type"
            name="type"
            defaultValue="WHATSAPP"
            options={Object.entries(CONTACT_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <TextField label="Datum" name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <TextField label="Samenvatting" name="summary" required placeholder="Bijv. voortgang besproken, doelen bijgesteld" />
        <TextAreaField label="Notities" name="notes" />
        <SubmitButton label="Opslaan" />
      </form>
    </FormCard>
  );
}
