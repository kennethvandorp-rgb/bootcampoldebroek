import Link from "next/link";
import type { ClientDetail } from "@/lib/queries";
import { CONTACT_TYPE_ICONS, CONTACT_TYPE_LABELS, formatDateTime } from "@/lib/domain";
import { deleteContactMoment } from "../actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";

/** Complete tijdlijn van alle interacties met de klant, nieuwste bovenaan. */
export default function ContactMomentsSection({
  clientId,
  contactMoments,
}: {
  clientId: string;
  contactMoments: ClientDetail["contactMoments"];
}) {
  return (
    <section className="space-y-3">
      <SectionHeader title="Tijdlijn" addHref={`/klanten/${clientId}/contact/nieuw`} addLabel="Contact loggen" />

      {contactMoments.length === 0 ? (
        <EmptyState text="Nog geen contactmomenten geregistreerd." />
      ) : (
        <ol className="relative space-y-4 border-l-2 border-slate-200 pl-6">
          {contactMoments.map((cm) => (
            <li key={cm.id} className="relative">
              <span
                className="absolute -left-[37px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-sm"
                aria-hidden
              >
                {CONTACT_TYPE_ICONS[cm.type]}
              </span>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {CONTACT_TYPE_LABELS[cm.type]}
                      {cm.summary && cm.summary !== CONTACT_TYPE_LABELS[cm.type] && (
                        <span className="font-normal text-slate-600"> — {cm.summary}</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(cm.date)}
                      {cm.trainer && <> · {cm.trainer.name}</>}
                    </p>
                  </div>
                  <form action={deleteContactMoment.bind(null, clientId, cm.id)}>
                    <ConfirmSubmitButton
                      confirmMessage="Contactmoment verwijderen?"
                      className="rounded px-1.5 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      ✕
                    </ConfirmSubmitButton>
                  </form>
                </div>
                {cm.notes && <p className="mt-2 whitespace-pre-wrap text-slate-700">{cm.notes}</p>}
                {cm.inBodyMeasurement && (
                  <p className="mt-2 inline-flex flex-wrap gap-x-3 rounded-lg bg-sky-50 px-2 py-1 text-xs text-sky-800">
                    {cm.inBodyMeasurement.weightKg != null && <span>{cm.inBodyMeasurement.weightKg} kg</span>}
                    {cm.inBodyMeasurement.skeletalMuscleMassKg != null && (
                      <span>spier {cm.inBodyMeasurement.skeletalMuscleMassKg} kg</span>
                    )}
                    {cm.inBodyMeasurement.bodyFatPercent != null && <span>vet {cm.inBodyMeasurement.bodyFatPercent}%</span>}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function SectionHeader({ title, addHref, addLabel }: { title: string; addHref: string; addLabel: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <Link href={addHref} className="text-sm font-medium text-emerald-700 hover:underline">
        + {addLabel}
      </Link>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">{text}</p>;
}
