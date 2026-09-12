import Link from "next/link";
import type { ContactMoment, InBodyMeasurement } from "@/generated/prisma/client";
import { CONTACT_TYPE_LABELS, formatDate } from "@/lib/domain";
import { deleteContactMoment } from "../actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";

type ContactMomentWithInBody = ContactMoment & { inBodyMeasurement: InBodyMeasurement | null };

export default function ContactMomentsSection({
  clientId,
  contactMoments,
}: {
  clientId: string;
  contactMoments: ContactMomentWithInBody[];
}) {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Contactmomenten"
        addHref={`/klanten/${clientId}/contact/nieuw`}
        addLabel="Nieuw contactmoment"
      />

      {contactMoments.length === 0 ? (
        <EmptyState text="Nog geen contactmomenten geregistreerd." />
      ) : (
        <ul className="space-y-2">
          {contactMoments.map((cm) => (
            <li key={cm.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {CONTACT_TYPE_LABELS[cm.type]}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(cm.date)}</span>
                  </div>
                  <p className="mt-1 font-medium text-slate-900">{cm.summary}</p>
                  {cm.notes && <p className="mt-0.5 text-slate-600">{cm.notes}</p>}
                </div>
                <form action={deleteContactMoment.bind(null, clientId, cm.id)}>
                  <ConfirmSubmitButton confirmMessage="Contactmoment verwijderen?">Verwijderen</ConfirmSubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function SectionHeader({ title, addHref, addLabel }: { title: string; addHref: string; addLabel: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-medium text-slate-900">{title}</h2>
      <Link href={addHref} className="text-sm font-medium text-slate-700 hover:underline">
        + {addLabel}
      </Link>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">{text}</p>;
}
