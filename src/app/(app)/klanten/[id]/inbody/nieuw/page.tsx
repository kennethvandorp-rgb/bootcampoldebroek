import { toDateTimeInputValue } from "@/lib/domain";
import FormCard from "@/components/FormCard";
import { TextField, TextAreaField, SubmitButton } from "@/components/fields";
import { createInBodyMeasurement } from "../../actions";

export default async function NewInBodyMeasurementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <FormCard
      title="Nieuwe InBody-meting"
      description="Registreer de resultaten van de InBody-meting."
      backHref={`/klanten/${id}`}
    >
      <form action={createInBodyMeasurement.bind(null, id)} className="space-y-4">
        <TextField label="Datum en tijd" name="date" type="datetime-local" defaultValue={toDateTimeInputValue()} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Gewicht (kg)" name="weightKg" type="number" />
          <TextField label="Skeletspiermassa (kg)" name="skeletalMuscleMassKg" type="number" />
          <TextField label="Lichaamsvet (%)" name="bodyFatPercent" type="number" />
          <TextField label="Vetmassa (kg)" name="bodyFatMassKg" type="number" />
          <TextField label="BMI" name="bmi" type="number" />
          <TextField label="Visceraal vetniveau" name="visceralFatLevel" type="number" />
          <TextField label="Totaal lichaamswater (L)" name="totalBodyWaterL" type="number" />
          <TextField label="BMR (kcal)" name="bmrKcal" type="number" />
        </div>

        <TextAreaField label="Notities" name="notes" />

        <div className="flex items-center gap-2">
          <input
            id="createContactMoment"
            name="createContactMoment"
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-slate-300"
          />
          <label htmlFor="createContactMoment" className="text-sm text-slate-700">
            Ook registreren als contactmoment
          </label>
        </div>

        <SubmitButton label="Opslaan" />
      </form>
    </FormCard>
  );
}
