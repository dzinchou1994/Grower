"use client";

import type { DiarySetup } from "@/lib/diary-setup";

export type DiarySetupDict = {
  sectionTitle: string;
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

const addRowButtonClass =
  "inline-flex w-fit items-center rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-lime-300 transition hover:border-lime-400/25 hover:bg-white/[0.06]";

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
    <div className="space-y-2">
      <span className="block text-sm font-medium text-slate-300">{label}</span>
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((val, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={val}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = e.target.value;
                  onChange(next);
                }}
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500"
                placeholder={placeholder}
              />
              <button
                type="button"
                onClick={() => {
                  const next = items.filter((_, j) => j !== i);
                  onChange(next);
                }}
                className="shrink-0 rounded-full border border-white/15 px-3 py-2 text-xs text-slate-300 hover:bg-white/10"
              >
                {removeLabel}
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className={addRowButtonClass}
      >
        + {addLabel}
      </button>
    </div>
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
    <div className="sm:col-span-2 space-y-5 rounded-2xl border border-white/8 bg-white/[0.03] p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-white">{setupDict.sectionTitle}</h2>
        <p className="mt-1 text-xs text-slate-500">{setupDict.hint}</p>
      </div>

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

      <div className="space-y-2">
        <span className="block text-sm font-medium text-slate-300">{setupDict.substrates}</span>
        {value.substrates.length > 0 ? (
          <div className="space-y-2">
            {value.substrates.map((row, i) => (
              <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="min-w-0 flex-1">
                  <span className="mb-1 block text-xs text-slate-500">{setupDict.substrateManufacturer}</span>
                  <input
                    value={row.name}
                    onChange={(e) => {
                      const next = [...value.substrates];
                      next[i] = { ...next[i]!, name: e.target.value, percent: null };
                      onChange({ ...value, substrates: next });
                    }}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500"
                    placeholder={setupDict.substrateManufacturerPlaceholder}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const filtered = value.substrates.filter((_, j) => j !== i);
                    onChange({ ...value, substrates: filtered });
                  }}
                  className="shrink-0 rounded-full border border-white/15 px-3 py-2 text-xs text-slate-300 hover:bg-white/10 sm:mt-5"
                >
                  {setupDict.remove}
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() =>
            onChange({
              ...value,
              substrates: [...value.substrates, { name: "", percent: null }],
            })
          }
          className={addRowButtonClass}
        >
          + {setupDict.add}
        </button>
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
  );
}
