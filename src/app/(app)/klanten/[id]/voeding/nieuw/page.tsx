import FormCard from "@/components/FormCard";
import { TextField, TextAreaField, SubmitButton } from "@/components/fields";
import { createNutritionAnalysis } from "../../actions";

export default async function NewNutritionAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <FormCard
      title="Nieuwe voedingsanalyse"
      description="Leg de voedingsanalyse en het advies vast."
      backHref={`/klanten/${id}`}
    >
      <form action={createNutritionAnalysis.bind(null, id)} className="space-y-4">
        <TextField label="Datum" name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField label="Kcal doel" name="kcalTarget" type="number" />
          <TextField label="Eiwit (g)" name="proteinGrams" type="number" />
          <TextField label="Koolhydraten (g)" name="carbsGrams" type="number" />
          <TextField label="Vet (g)" name="fatGrams" type="number" />
        </div>

        <TextAreaField label="Samenvatting" name="summary" required placeholder="Bijv. huidig voedingspatroon en bevindingen" />
        <TextAreaField label="Advies" name="advice" />

        <SubmitButton label="Opslaan" />
      </form>
    </FormCard>
  );
}
