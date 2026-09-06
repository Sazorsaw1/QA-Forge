import type {
  CaseKind,
  FieldId,
  GenerateOptions,
  GeneratedRow,
  PackId,
} from "../types";
import { PACK_FIELDS } from "../types";
import { createRng } from "./rng";
import { defaultExpect, generateField } from "./fields";
import { curatedPackRows } from "./packs";

function resolveFields(pack: PackId, customFields: FieldId[]): FieldId[] {
  if (pack === "custom") {
    return customFields.length > 0 ? customFields : ["email", "password"];
  }
  return PACK_FIELDS[pack];
}

function pickKind(mode: GenerateOptions["mode"], rng: ReturnType<typeof createRng>): CaseKind {
  if (mode === "valid" || mode === "boundary" || mode === "invalid") return mode;
  return rng.pick(["valid", "boundary", "invalid"] as const);
}

function buildRow(
  index: number,
  fields: FieldId[],
  kind: CaseKind,
  options: GenerateOptions,
  rng: ReturnType<typeof createRng>,
): GeneratedRow {
  const tags = new Set<string>([options.pack, kind]);
  let expectHint = defaultExpect(kind);
  const data: Record<string, string | number | boolean> = {};

  let password: string | undefined;
  if (fields.includes("password")) {
    const pw = generateField("password", rng, options.locale, kind);
    password = String(pw.value);
    data.password = pw.value;
    pw.tags.forEach((t) => tags.add(t));
    if (pw.expectHint) expectHint = pw.expectHint;
  }

  for (const field of fields) {
    if (field === "password") continue;
    const result = generateField(field, rng, options.locale, kind, { password });
    data[field] = result.value;
    result.tags.forEach((t) => tags.add(t));
    if (result.expectHint) expectHint = result.expectHint;
  }

  return {
    id: `row-${String(index + 1).padStart(3, "0")}`,
    case: kind,
    tags: Array.from(tags),
    expectHint,
    ...data,
  };
}

export function generateRows(options: GenerateOptions): GeneratedRow[] {
  const count = Math.min(100, Math.max(1, Math.floor(options.count)));
  const rng = createRng(options.seed);
  const fields = resolveFields(options.pack, options.customFields);
  const rows: GeneratedRow[] = [];

  const curated = curatedPackRows(options.pack, options.locale, rng);
  const useCurated =
    curated.length > 0 &&
    (options.mode === "mixed" ||
      options.mode === "invalid" ||
      options.mode === "boundary");

  if (useCurated) {
    const filtered =
      options.mode === "mixed"
        ? curated
        : curated.filter((r) => r.case === options.mode || (options.mode === "invalid" && r.case === "invalid"));

    for (const c of filtered) {
      if (rows.length >= count) break;
      if (options.mode === "boundary" && c.case !== "boundary") continue;
      if (options.mode === "invalid" && c.case === "valid") continue;
      rows.push({
        id: `row-${String(rows.length + 1).padStart(3, "0")}`,
        ...c,
      } as GeneratedRow);
    }
  }

  while (rows.length < count) {
    const kind = pickKind(options.mode, rng);
    rows.push(buildRow(rows.length, fields, kind, options, rng));
  }

  return rows.slice(0, count);
}

export { createRng } from "./rng";
export { generateField } from "./fields";
