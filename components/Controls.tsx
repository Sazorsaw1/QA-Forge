"use client";

import {
  ALL_FIELDS,
  type FieldId,
  type GenerateOptions,
  type Locale,
  type Mode,
  type PackId,
} from "@/lib/types";

interface ControlsProps {
  options: GenerateOptions;
  onChange: (next: GenerateOptions) => void;
  onGenerate: () => void;
}

const PACKS: { id: PackId; label: string }[] = [
  { id: "login", label: "Login" },
  { id: "signup", label: "Signup" },
  { id: "checkout", label: "Checkout (light)" },
  { id: "profile", label: "Profile" },
  { id: "search", label: "Search" },
  { id: "custom", label: "Custom" },
];

const MODES: Mode[] = ["valid", "boundary", "invalid", "mixed"];

export function Controls({ options, onChange, onGenerate }: ControlsProps) {
  const set = <K extends keyof GenerateOptions>(key: K, value: GenerateOptions[K]) =>
    onChange({ ...options, [key]: value });

  const toggleField = (id: FieldId) => {
    const has = options.customFields.includes(id);
    set(
      "customFields",
      has ? options.customFields.filter((f) => f !== id) : [...options.customFields, id],
    );
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">Controls</h2>
          <p className="text-sm text-zinc-400">
            Same seed → identical output. Attack payloads are negative-test only.
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
        >
          Generate
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-zinc-300">Locale</span>
          <select
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            value={options.locale}
            onChange={(e) => set("locale", e.target.value as Locale)}
          >
            <option value="en">en</option>
            <option value="id">id</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-zinc-300">Seed</span>
          <input
            type="number"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            value={options.seed}
            onChange={(e) => set("seed", Number(e.target.value) || 0)}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-zinc-300">Count (1–100)</span>
          <input
            type="number"
            min={1}
            max={100}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
            value={options.count}
            onChange={(e) =>
              set("count", Math.min(100, Math.max(1, Number(e.target.value) || 1)))
            }
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-zinc-300">Mode</span>
          <select
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 capitalize"
            value={options.mode}
            onChange={(e) => set("mode", e.target.value as Mode)}
          >
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
          <span className="text-zinc-300">Pack</span>
          <div className="flex flex-wrap gap-2">
            {PACKS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => set("pack", p.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  options.pack === p.id
                    ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-300"
                    : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </label>
      </div>

      {options.pack === "custom" && (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="mb-3 text-sm font-medium text-zinc-200">Custom field picker</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {ALL_FIELDS.map((f) => (
              <label
                key={f.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-800 px-2 py-1.5 text-xs text-zinc-300 hover:border-zinc-600"
              >
                <input
                  type="checkbox"
                  checked={options.customFields.includes(f.id)}
                  onChange={() => toggleField(f.id)}
                  className="accent-emerald-500"
                />
                {f.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
