import type { CaseKind, ExpectHint, GeneratedRow, Locale, PackId } from "../types";
import type { Rng } from "./rng";
import { XSS_SAMPLES, SQL_ISH } from "./data";
import { generateField } from "./fields";

type Curated = Omit<GeneratedRow, "id">;

function row(
  kind: CaseKind,
  tags: string[],
  expectHint: ExpectHint,
  fields: Record<string, string | number | boolean>,
): Curated {
  return { case: kind, tags, expectHint, ...fields };
}

/** Intentional curated negatives + positives for Login / Signup / Search */
export function curatedPackRows(pack: PackId, locale: Locale, rng: Rng): Curated[] {
  if (pack === "login") {
    const validEmail = generateField("email", rng, locale, "valid").value as string;
    const strong = generateField("password", rng, locale, "valid").value as string;
    return [
      row("valid", ["login", "happy-path"], "should_pass", {
        email: validEmail,
        password: strong,
      }),
      row("invalid", ["login", "empty", "negative"], "should_fail", {
        email: "",
        password: "",
      }),
      row("invalid", ["login", "xss", "negative"], "should_sanitize", {
        email: XSS_SAMPLES[0],
        password: strong,
      }),
      row("invalid", ["login", "weak", "negative"], "should_fail", {
        email: validEmail,
        password: "password",
      }),
      row("boundary", ["login", "whitespace", "boundary"], "should_fail", {
        email: "   ",
        password: "   ",
      }),
      row("invalid", ["login", "sql-ish", "negative"], "should_sanitize", {
        email: `admin${SQL_ISH[0]}@example.com`,
        password: strong,
      }),
    ];
  }

  if (pack === "signup") {
    const name = generateField("fullName", rng, locale, "valid").value as string;
    const user = generateField("username", rng, locale, "valid").value as string;
    const email = generateField("email", rng, locale, "valid").value as string;
    const pass = generateField("password", rng, locale, "valid").value as string;
    const phone = generateField("phone", rng, locale, "valid").value as string;
    return [
      row("valid", ["signup", "happy-path"], "should_pass", {
        fullName: name,
        username: user,
        email,
        password: pass,
        confirmPassword: pass,
        phone,
      }),
      row("invalid", ["signup", "empty", "negative"], "should_fail", {
        fullName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
      }),
      row("invalid", ["signup", "xss", "negative"], "should_sanitize", {
        fullName: name,
        username: user,
        email: XSS_SAMPLES[1],
        password: pass,
        confirmPassword: pass,
        phone,
      }),
      row("invalid", ["signup", "weak", "mismatch", "negative"], "should_fail", {
        fullName: name,
        username: user,
        email,
        password: "123456",
        confirmPassword: "654321",
        phone,
      }),
      row("boundary", ["signup", "very-long", "boundary"], "should_fail", {
        fullName: "x".repeat(200),
        username: "u".repeat(80),
        email: `${"a".repeat(64)}@example.com`,
        password: "P".repeat(256),
        confirmPassword: "P".repeat(256),
        phone: "08",
      }),
      row("invalid", ["signup", "sql-ish", "negative"], "should_sanitize", {
        fullName: name,
        username: SQL_ISH[2],
        email,
        password: pass,
        confirmPassword: pass,
        phone,
      }),
    ];
  }

  if (pack === "search") {
    const q = generateField("searchQuery", rng, locale, "valid").value as string;
    return [
      row("valid", ["search", "happy-path"], "should_pass", { searchQuery: q }),
      row("invalid", ["search", "empty", "negative"], "should_fail", { searchQuery: "" }),
      row("invalid", ["search", "xss", "negative"], "should_sanitize", {
        searchQuery: XSS_SAMPLES[2],
      }),
      row("invalid", ["search", "sql-ish", "negative"], "should_sanitize", {
        searchQuery: SQL_ISH[1],
      }),
      row("boundary", ["search", "whitespace", "boundary"], "should_fail", {
        searchQuery: "     ",
      }),
      row("boundary", ["search", "emoji", "very-long", "boundary"], "should_fail", {
        searchQuery: `🔥 ${"q".repeat(400)}`,
      }),
    ];
  }

  return [];
}
