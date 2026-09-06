"use client";

import { useMemo, useState } from "react";
import {
  ALL_FIELDS,
  type FieldId,
  type GenerateOptions,
  type GeneratedRow,
} from "@/lib/types";
import { regenerateFieldValue, resolveFields } from "@/lib/generate";

const META = new Set(["id", "case", "tags", "expectHint"]);

interface EditableResultsProps {
  rows: GeneratedRow[];
  options: GenerateOptions;
  onRowsChange: (rows: GeneratedRow[]) => void;
  onRegenerateAll: () => void;
  lockedKeys: Set<string>;
  onLockedKeysChange: (next: Set<string>) => void;
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
    should_pass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
    should_fail: "bg-rose-500/10 text-rose-300 border-rose-500/25",
    should_sanitize: "bg-amber-500/10 text-amber-300 border-amber-500/25",
  };
  return styles[hint] ?? "bg-zinc-800 text-zinc-300 border-zinc-700";
}

function fieldLabel(id: string): string {
  return ALL_FIELDS.find((f) => f.id === id)?.label ?? id;
}

function fieldKeysForRow(row: GeneratedRow, options: GenerateOptions): string[] {
  const packFields = resolveFields(options.pack, options.customFields);
  const fromPack = packFields;
  const extras = Object.keys(row).filter(
    (k) => !META.has(k) && !fromPack.includes(k as FieldId),
  );
  // Prefer pack order; include any extra generated keys (e.g. curated rows)
  const ordered = [...fromPack];
  for (const k of extras) {
    if (!ordered.includes(k as FieldId)) ordered.push(k as FieldId);
  }
  // Only show keys that exist on the row (curated may omit some pack fields)
  const present = ordered.filter((k) => k in row);
  if (present.length > 0) return present;
  return Object.keys(row).filter((k) => !META.has(k));
}

export function EditableResults({
  rows,
  options,
  onRowsChange,
  onRegenerateAll,
  lockedKeys,
  onLockedKeysChange,
}: EditableResultsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const safeIndex = rows.length === 0 ? 0 : Math.min(selectedIndex, rows.length - 1);
  const row = rows[safeIndex];

  const fields = useMemo(
    () => (row ? fieldKeysForRow(row, options) : []),
    [row, options],
  );

  if (rows.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-500">
        No rows yet. Adjust controls and hit Generate.
      </section>
    );
  }

  const updateField = (key: string, value: string) => {
    const next = rows.map((r, i) => {
      if (i !== safeIndex) return r;
      const prev = r[key];
      let coerced: string | number | boolean = value;
      if (typeof prev === "number") {
        const n = Number(value);
        coerced = Number.isFinite(n) ? n : value;
      } else if (typeof prev === "boolean") {
        coerced = value === "true" || value === "1";
      }
      return { ...r, [key]: coerced };
    });
    onRowsChange(next);
  };

  const copyField = async (key: string) => {
    const value = String(row[key] ?? "");
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 1200);
    } catch {
      setCopiedField(null);
    }
  };

  const rerollField = (key: string) => {
    if (!(key in row) || META.has(key)) return;
    const password =
      key === "confirmPassword" && "password" in row
        ? String(row.password)
        : undefined;
    const result = regenerateFieldValue(
      key as FieldId,
      { locale: options.locale, seed: options.seed },
      safeIndex,
      row.case,
      { password },
    );
    const next = rows.map((r, i) => {
      if (i !== safeIndex) return r;
      const tags = new Set(r.tags);
      result.tags.forEach((t) => tags.add(t));
      return {
        ...r,
        [key]: result.value,
        tags: Array.from(tags),
        ...(result.expectHint ? { expectHint: result.expectHint } : {}),
      };
    });
    onRowsChange(next);
  };

  const toggleLock = (key: string) => {
    const lockId = `${safeIndex}:${key}`;
    const next = new Set(lockedKeys);
    if (next.has(lockId)) next.delete(lockId);
    else next.add(lockId);
    onLockedKeysChange(next);
  };

  const lockedCount = fields.filter((f) => lockedKeys.has(`${safeIndex}:${f}`)).length;

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800 px-5 py-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">Editable fields</h2>
          <p className="text-xs text-zinc-500">
            Edit values by hand · Copy per field · Re-roll uses seed + row + field
            (deterministic)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500">
            {rows.length} row{rows.length === 1 ? "" : "s"}
            {lockedCount > 0 ? ` · ${lockedCount} locked here` : ""}
          </span>
          <button
            type="button"
            onClick={onRegenerateAll}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm font-medium text-zinc-100 transition hover:border-emerald-500/50 hover:text-emerald-300"
            title="Regenerate unlocked fields; locked fields are kept"
          >
            Regenerate all
          </button>
        </div>
      </div>

      {rows.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/80 px-5 py-3">
          <button
            type="button"
            disabled={safeIndex <= 0}
            onClick={() => setSelectedIndex((i) => Math.max(0, i - 1))}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-300 disabled:opacity-40"
          >
            Prev
          </button>
          <div className="flex max-w-full flex-1 flex-wrap gap-1.5 overflow-x-auto">
            {rows.map((r, i) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedIndex(i)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  i === safeIndex
                    ? "bg-zinc-100 text-zinc-900"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {r.id}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={safeIndex >= rows.length - 1}
            onClick={() => setSelectedIndex((i) => Math.min(rows.length - 1, i + 1))}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <div className="space-y-4 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${caseBadge(row.case)}`}
          >
            {row.case}
          </span>
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 font-mono text-xs ${hintBadge(row.expectHint)}`}
          >
            {row.expectHint}
          </span>
          {row.tags.map((t) => (
            <span
              key={t}
              className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400"
            >
              {t}
            </span>
          ))}
          {(row.tags.includes("xss") || row.tags.includes("sql-ish")) && (
            <span className="rounded-md bg-rose-950 px-2 py-0.5 text-[10px] text-rose-300">
              negative-test only
            </span>
          )}
        </div>

        <div className="grid gap-3">
          {fields.map((key) => {
            const lockId = `${safeIndex}:${key}`;
            const locked = lockedKeys.has(lockId);
            const value = row[key];
            const display =
              typeof value === "boolean" ? String(value) : String(value ?? "");

            return (
              <div
                key={key}
                className={`rounded-xl border p-3 transition ${
                  locked
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-zinc-800 bg-zinc-950/50"
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor={`field-${safeIndex}-${key}`}
                    className="text-sm font-medium text-zinc-200"
                  >
                    {fieldLabel(key)}
                    <span className="ml-2 font-mono text-[10px] text-zinc-500">{key}</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => copyField(key)}
                      className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] font-medium text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-300"
                    >
                      {copiedField === key ? "Copied" : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => rerollField(key)}
                      disabled={locked}
                      className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] font-medium text-zinc-300 hover:border-sky-500/40 hover:text-sky-300 disabled:opacity-40"
                      title="Deterministic from seed + row + field"
                    >
                      Re-roll
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLock(key)}
                      className={`rounded-lg border px-2 py-1 text-[11px] font-medium transition ${
                        locked
                          ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
                          : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500"
                      }`}
                    >
                      {locked ? "Locked" : "Lock"}
                    </button>
                  </div>
                </div>
                <input
                  id={`field-${safeIndex}-${key}`}
                  type="text"
                  value={display}
                  onChange={(e) => updateField(key, e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 outline-none focus:border-emerald-500/50"
                />
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3 text-sm leading-relaxed text-sky-100/90">
          <p className="font-medium text-sky-200">Learning tip</p>
          <p className="mt-1 text-xs text-sky-100/70 sm:text-sm">
            Edit the values, then write your own Playwright — use these fields in{" "}
            <code className="rounded bg-zinc-950/60 px-1 py-0.5 font-mono text-[11px] text-sky-200">
              page.fill()
            </code>{" "}
            and assert from{" "}
            <code className="rounded bg-zinc-950/60 px-1 py-0.5 font-mono text-[11px] text-sky-200">
              expectHint
            </code>
            . No bulk fixture dump — practice wiring the test yourself.
          </p>
        </div>
      </div>
    </section>
  );
}
