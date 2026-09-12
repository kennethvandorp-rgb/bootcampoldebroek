import ClientForm from "@/components/ClientForm";
import { createClient } from "../actions";

export default function NewClientPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Nieuwe klant</h1>
        <p className="mt-1 text-sm text-slate-500">Voeg een nieuwe klant toe aan het volgsysteem.</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <ClientForm action={createClient} submitLabel="Klant toevoegen" />
      </div>
    </div>
  );
}
