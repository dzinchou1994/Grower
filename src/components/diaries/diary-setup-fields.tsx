"use client";

import type { DiarySetup } from "@/lib/diary-setup";

export type DiarySetupDict = {
  sectionTitle: string;
  /** Short label for the mobile collapsible summary (matches diary overview row). */
  collapsibleEyebrow: string;
  hint: string;
  tents: string;
  lights: string;
  fans: string;
  airFilters: string;
  substrates: string;
  fertilizers: string;
  add: string;
  remove: string;
  substrateManufacturer: string;
  substrateManufacturerPlaceholder: string;
  itemPlaceholder: string;
  lightsPlaceholder: string;
  /** Placeholder for fertilizer lines (brand + product). */
  fertilizerPlaceholder: string;
};

const setupInputClass =
  "w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-slate-500 transition focus:border-yellow-400/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/15";

const addButtonClass =
  "flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/[0.12] bg-white/[0.02] py-2.5 text-xs font-medium text-yellow-300/95 transition hover:border-yellow-400/30 hover:bg-yellow-400/[0.06] hover:text-yellow-200";

function SetupCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-4 shadow-sm shadow-black/30 ring-1 ring-white/[0.04]">
      <h3 className="text-left text-xs font-semibold leading-snug text-slate-200">{title}</h3>
      <div className="mt-3 min-h-0 flex-1 space-y-2">{children}</div>
      <div className="mt-3 border-t border-white/[0.06] pt-3">{action}</div>
    </div>
  );
}

function StringListBlock({
  label,
  items,
  placeholder,
  addLabel,
  removeLabel,
  onChange,
}: {
  label: string;
  items: string[];
  placeholder: string;
  addLabel: string;
  removeLabel: string;
  onChange: (next: string[]) => void;
}) {
  return (
    <SetupCard
      title={label}
      action={
        <button type="button" onClick={() => onChange([...items, ""])} className={addButtonClass}>
          <span className="text-base leading-none">+</span>
          {addLabel}
        </button>
      }
    >
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((val, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={val}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = e.target.value;
                  onChange(next);
                }}
                className={`min-w-0 flex-1 ${setupInputClass}`}
                placeholder={placeholder}
              />
              <button
                type="button"
                onClick={() => {
                  const next = items.filter((_, j) => j !== i);
                  onChange(next);
                }}
                className="shrink-0 rounded-lg border border-white/[0.08] px-2.5 py-2 text-[11px] text-slate-400 transition hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-200"
                aria-label={removeLabel}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] leading-relaxed text-slate-600">-</p>
      )}
    </SetupCard>
  );
}

export function DiarySetupFields({
  value,
  onChange,
  setupDict,
}: {
  value: DiarySetup;
  onChange: (next: DiarySetup) => void;
  setupDict: DiarySetupDict;
}) {
  function setList<K extends keyof DiarySetup>(key: K, list: string[]) {
    onChange({ ...value, [key]: list } as DiarySetup);
  }

  return (
    <div className="sm:col-span-2 overflow-hidden rounded-2xl border border-white/[0.07] bg-black/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="border-b border-white/[0.06] bg-white/[0.02] px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">{setupDict.sectionTitle}</h2>
        <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-[13px]">{setupDict.hint}</p>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-5 sm:p-6">
        <StringListBlock
          label={setupDict.tents}
          items={value.tents}
          placeholder={setupDict.itemPlaceholder}
          addLabel={setupDict.add}
          removeLabel={setupDict.remove}
          onChange={(list) => setList("tents", list)}
        />

        <StringListBlock
          label={setupDict.lights}
          items={value.lights}
          placeholder={setupDict.lightsPlaceholder}
          addLabel={setupDict.add}
          removeLabel={setupDict.remove}
          onChange={(list) => setList("lights", list)}
        />

        <StringListBlock
          label={setupDict.fans}
          items={value.fans}
          placeholder={setupDict.itemPlaceholder}
          addLabel={setupDict.add}
          removeLabel={setupDict.remove}
          onChange={(list) => setList("fans", list)}
        />

        <StringListBlock
          label={setupDict.airFilters}
          items={value.airFilters}
          placeholder={setupDict.itemPlaceholder}
          addLabel={setupDict.add}
          removeLabel={setupDict.remove}
          onChange={(list) => setList("airFilters", list)}
        />

        <div className="flex min-h-0 flex-col rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-4 shadow-sm shadow-black/30 ring-1 ring-white/[0.04]">
          <h3 className="text-left text-xs font-semibold leading-snug text-slate-200">{setupDict.substrates}</h3>
          {value.substrates.length > 0 ? (
            <div className="mt-3 space-y-2">
              {value.substrates.map((row, i) => (
                <div key={i} className="flex items-end gap-2">
                  <label className="min-w-0 flex-1">
                    <span className="mb-1 block text-[10px] text-slate-500">{setupDict.substrateManufacturer}</span>
                    <input
                      value={row.name}
                      onChange={(e) => {
                        const next = [...value.substrates];
                        next[i] = { ...next[i]!, name: e.target.value, percent: null };
                        onChange({ ...value, substrates: next });
                      }}
                      className={setupInputClass}
                      placeholder={setupDict.substrateManufacturerPlaceholder}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const filtered = value.substrates.filter((_, j) => j !== i);
                      onChange({ ...value, substrates: filtered });
                    }}
                    className="shrink-0 rounded-lg border border-white/[0.08] px-2.5 py-2 text-[11px] text-slate-400 transition hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-200"
                    aria-label={setupDict.remove}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-[11px] text-slate-600">-</p>
          )}
          <div className="mt-3 border-t border-white/[0.06] pt-3">
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...value,
                  substrates: [...value.substrates, { name: "", percent: null }],
                })
              }
              className={addButtonClass}
            >
              <span className="text-base leading-none">+</span>
              {setupDict.add}
            </button>
          </div>
        </div>

        <StringListBlock
          label={setupDict.fertilizers}
          items={value.fertilizers}
          placeholder={setupDict.fertilizerPlaceholder}
          addLabel={setupDict.add}
          removeLabel={setupDict.remove}
          onChange={(list) => setList("fertilizers", list)}
        />
      </div>
    </div>
  );
}
