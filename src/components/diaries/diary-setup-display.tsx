import type { DiarySetup } from "@/lib/diary-setup";
import { diarySetupHasContent } from "@/lib/diary-setup";
import type { DiarySetupDict } from "@/components/diaries/diary-setup-fields";

function ListSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</h3>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-200">
        {items.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

export function DiarySetupDisplay({
  setup,
  labels,
}: {
  setup: DiarySetup;
  labels: DiarySetupDict;
}) {
  if (!diarySetupHasContent(setup)) {
    return null;
  }

  const subs = setup.substrates.filter((r) => r.name.trim().length > 0);

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 sm:rounded-[2rem] sm:p-8">
      <h2 className="text-lg font-semibold text-white">{labels.sectionTitle}</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <ListSection title={labels.tents} items={setup.tents} />
        <ListSection title={labels.lights} items={setup.lights} />
        <ListSection title={labels.fans} items={setup.fans} />
        <ListSection title={labels.airFilters} items={setup.airFilters} />
        {subs.length > 0 ? (
          <div className="sm:col-span-2">
            <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {labels.substrates}
            </h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-200">
              {subs.map((r, i) => (
                <li key={i}>{r.name}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <ListSection title={labels.fertilizers} items={setup.fertilizers} />
      </div>
    </section>
  );
}
