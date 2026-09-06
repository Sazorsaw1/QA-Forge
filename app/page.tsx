"use client";

import { useCallback, useMemo, useState } from "react";
import { Controls } from "@/components/Controls";
import { ResultsTable } from "@/components/ResultsTable";
import { ExportPanel } from "@/components/ExportPanel";
import { generateRows } from "@/lib/generate";
import type { GenerateOptions, GeneratedRow } from "@/lib/types";

const DEFAULTS: GenerateOptions = {
  locale: "en",
  seed: 42,
  count: 10,
  mode: "mixed",
  pack: "login",
  customFields: ["email", "password", "username"],
};

export default function HomePage() {
  const [options, setOptions] = useState<GenerateOptions>(DEFAULTS);
  const [rows, setRows] = useState<GeneratedRow[]>(() => generateRows(DEFAULTS));

  const onGenerate = useCallback(() => {
    setRows(generateRows(options));
  }, [options]);

  const summary = useMemo(() => {
    const counts = { valid: 0, boundary: 0, invalid: 0 };
    for (const r of rows) counts[r.case] += 1;
    return counts;
  }, [rows]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          Client-side · Seeded · Playwright-ready
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          QA Forge
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          Fake data generator for QA and Playwright. Pick a pack, lock a seed for
          reproducible fixtures, and export JSON, CSV, or ready-to-paste TypeScript.
          Attack-like payloads are for{" "}
          <span className="text-amber-300">negative tests only</span>.
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
          <span className="rounded-md bg-zinc-900 px-2 py-1">valid: {summary.valid}</span>
          <span className="rounded-md bg-zinc-900 px-2 py-1">boundary: {summary.boundary}</span>
          <span className="rounded-md bg-zinc-900 px-2 py-1">invalid: {summary.invalid}</span>
          <span className="rounded-md bg-zinc-900 px-2 py-1">seed: {options.seed}</span>
        </div>
      </header>

      <Controls options={options} onChange={setOptions} onGenerate={onGenerate} />
      <ResultsTable rows={rows} />
      <ExportPanel rows={rows} />

      <footer className="border-t border-zinc-900 pt-4 text-center text-xs text-zinc-600">
        QA Forge MVP · MIT License · No database, no auth — everything runs in your browser.
      </footer>
    </main>
  );
}
