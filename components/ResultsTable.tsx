"use client";

import type { GeneratedRow } from "@/lib/types";

interface ResultsTableProps {
  rows: GeneratedRow[];
}

function caseBadge(kind: string) {
  const styles: Record<string, string> = {
    valid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    boundary: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    invalid: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  };
  return styles[kind] ?? "bg-zinc-700/40 text-zinc-300 border-zinc-600";
}

function hintBadge(hint: string) {
  const styles: Record<string, string> = {
    should_pass: "text-emerald-400",
    should_fail: "text-rose-400",
    should_sanitize: "text-amber-400",
  };
  return styles[hint] ?? "text-zinc-400";
}

function preview(row: GeneratedRow): string {
  const skip = new Set(["id", "case", "tags", "expectHint"]);
  const parts = Object.entries(row)
    .filter(([k]) => !skip.has(k))
    .slice(0, 4)
    .map(([k, v]) => {
      const s = String(v);
      const short = s.length > 40 ? `${s.slice(0, 37)}…` : s;
      return `${k}=${short}`;
    });
  return parts.join(" · ");
}

export function ResultsTable({ rows }: ResultsTableProps) {
  if (rows.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-500">
        No rows yet. Adjust controls and hit Generate.
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
        <h2 className="text-lg font-semibold text-zinc-50">Results</h2>
        <span className="text-xs text-zinc-400">{rows.length} rows</span>
      </div>
      <div className="max-h-[28rem] overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 bg-zinc-950/95 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Case</th>
              <th className="px-4 py-3 font-medium">Expect</th>
              <th className="px-4 py-3 font-medium">Tags</th>
              <th className="px-4 py-3 font-medium">Fields preview</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-zinc-800/80 hover:bg-zinc-800/40">
                <td className="px-4 py-3 font-mono text-xs text-zinc-300">{row.id}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${caseBadge(row.case)}`}
                  >
                    {row.case}
                  </span>
                </td>
                <td className={`px-4 py-3 font-mono text-xs ${hintBadge(row.expectHint)}`}>
                  {row.expectHint}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {row.tags.slice(0, 5).map((t) => (
                      <span
                        key={t}
                        className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400"
                      >
                        {t}
                      </span>
                    ))}
                    {row.tags.includes("xss") || row.tags.includes("sql-ish") ? (
                      <span className="rounded bg-rose-950 px-1.5 py-0.5 text-[10px] text-rose-300">
                        negative-test only
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="max-w-md truncate px-4 py-3 font-mono text-xs text-zinc-400">
                  {preview(row)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
