import Link from "next/link";

export default function FormCard({
  title,
  description,
  backHref,
  children,
}: {
  title: string;
  description?: string;
  backHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href={backHref} className="text-sm text-slate-500 hover:underline">
          &larr; Terug
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6">{children}</div>
    </div>
  );
}
