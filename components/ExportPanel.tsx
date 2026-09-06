"use client";

import { useMemo, useState } from "react";
import type { GeneratedRow } from "@/lib/types";
import {
  toCsv,
  toJson,
  toPlaywrightFixture,
  toTestEachSnippet,
} from "@/lib/export";

type Tab = "json" | "csv" | "fixture" | "testEach";

interface ExportPanelProps {
  rows: GeneratedRow[];
}

export function ExportPanel({ rows }: ExportPanelProps) {
  const [tab, setTab] = useState<Tab>("json");
  const [copied, setCopied] = useState(false);

  const content = useMemo(() => {
    switch (tab) {
      case "json":
        return toJson(rows);
      case "csv":
        return toCsv(rows);
      case "fixture":
        return toPlaywrightFixture(rows);
      case "testEach":
        return toTestEachSnippet(rows);
    }
  }, [rows, tab]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "json", label: "JSON" },
    { id: "csv", label: "CSV" },
    { id: "fixture", label: "Playwright fixture TS" },
    { id: "testEach", label: "test.each snippet" },
  ];

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-5 py-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">Export</h2>
          <p className="text-xs text-zinc-500">
            XSS / SQL-ish strings are labeled for negative tests only — do not use as real credentials.
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          disabled={rows.length === 0}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm font-medium text-zinc-100 transition hover:border-emerald-500/50 hover:text-emerald-300 disabled:opacity-40"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 px-5 pt-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              tab === t.id
                ? "bg-zinc-100 text-zinc-900"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <pre className="m-5 max-h-80 overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-300">
        {rows.length === 0 ? "// Generate rows to export" : content}
      </pre>
    </section>
  );
}
