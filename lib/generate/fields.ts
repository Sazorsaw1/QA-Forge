import type { CaseKind, ExpectHint, FieldId, Locale } from "../types";
import type { Rng } from "./rng";
import {
  CITIES_ID,
  COMPANIES,
  EMOJI,
  FIRST_NAMES_EN,
  FIRST_NAMES_ID,
  JOBS,
  LAST_NAMES_EN,
  LAST_NAMES_ID,
  PRODUCTS,
  PROVINCES_ID,
  SQL_ISH,
  UNICODE_SAMPLES,
  XSS_SAMPLES,
} from "./data";

export interface FieldValue {
  value: string | number | boolean;
  tags: string[];
  expectHint?: ExpectHint;
}

function firstName(rng: Rng, locale: Locale): string {
  return locale === "id" ? rng.pick(FIRST_NAMES_ID) : rng.pick(FIRST_NAMES_EN);
}

function lastName(rng: Rng, locale: Locale): string {
  return locale === "id" ? rng.pick(LAST_NAMES_ID) : rng.pick(LAST_NAMES_EN);
}

function strongPassword(rng: Rng): string {
  const upper = rng.chars("ABCDEFGHJKLMNPQRSTUVWXYZ", 2);
  const lower = rng.chars("abcdefghijkmnopqrstuvwxyz", 4);
  const digits = rng.chars("23456789", 2);
  const special = rng.chars("!@#$%^&*", 2);
  return rng.chars(`${upper}${lower}${digits}${special}`, 10);
}

function weakPassword(rng: Rng): string {
  return rng.pick(["password", "123456", "qwerty", "abc123", "admin"]);
}

function longString(n: number, ch = "x"): string {
  return ch.repeat(n);
}

export function generateField(
  field: FieldId,
  rng: Rng,
  locale: Locale,
  kind: CaseKind,
  ctx: { password?: string } = {},
): FieldValue {
  switch (field) {
    case "firstName":
      if (kind === "invalid") {
        return rng.bool()
          ? { value: "", tags: ["empty", "negative"], expectHint: "should_fail" }
          : { value: rng.pick(XSS_SAMPLES), tags: ["xss", "negative"], expectHint: "should_sanitize" };
      }
      if (kind === "boundary") {
        return rng.bool()
          ? { value: " ", tags: ["whitespace", "boundary"], expectHint: "should_fail" }
          : { value: longString(120), tags: ["very-long", "boundary"], expectHint: "should_fail" };
      }
      return { value: firstName(rng, locale), tags: ["identity"] };

    case "lastName":
      if (kind === "invalid") {
        return { value: rng.pick(XSS_SAMPLES), tags: ["xss", "negative"], expectHint: "should_sanitize" };
      }
      if (kind === "boundary") {
        return { value: longString(200), tags: ["very-long", "boundary"], expectHint: "should_fail" };
      }
      return { value: lastName(rng, locale), tags: ["identity"] };

    case "fullName": {
      if (kind === "invalid") {
        return { value: rng.pick(XSS_SAMPLES), tags: ["xss", "negative"], expectHint: "should_sanitize" };
      }
      if (kind === "boundary") {
        return rng.bool()
          ? { value: "", tags: ["empty", "boundary"], expectHint: "should_fail" }
          : {
              value: `${EMOJI.join("")} ${longString(80)}`,
              tags: ["emoji", "very-long", "boundary"],
              expectHint: "should_fail",
            };
      }
      return {
        value: `${firstName(rng, locale)} ${lastName(rng, locale)}`,
        tags: ["identity"],
      };
    }

    case "username": {
      if (kind === "invalid") {
        return rng.bool()
          ? { value: "ab", tags: ["too-short", "negative"], expectHint: "should_fail" }
          : {
              value: `user ${rng.pick(SQL_ISH)}`,
              tags: ["sql-ish", "negative"],
              expectHint: "should_sanitize",
            };
      }
      if (kind === "boundary") {
        return { value: longString(64, "u"), tags: ["very-long", "boundary"], expectHint: "should_fail" };
      }
      const base = firstName(rng, locale).toLowerCase();
      return { value: `${base}${rng.int(10, 99)}`, tags: ["identity"] };
    }

    case "bio": {
      if (kind === "invalid") {
        return { value: rng.pick(XSS_SAMPLES), tags: ["xss", "negative"], expectHint: "should_sanitize" };
      }
      if (kind === "boundary") {
        return rng.bool()
          ? { value: "   ", tags: ["whitespace", "boundary"], expectHint: "should_fail" }
          : { value: longString(2000), tags: ["very-long", "boundary"], expectHint: "should_fail" };
      }
      const snippets =
        locale === "id"
          ? ["QA engineer yang suka otomasi.", "Suka kopi dan test case.", "Belajar Playwright setiap hari."]
          : ["QA engineer who loves automation.", "Coffee-powered test writer.", "Building reliable suites daily."];
      return { value: rng.pick(snippets), tags: ["identity"] };
    }

    case "email": {
      if (kind === "invalid") {
        return rng.bool(0.5)
          ? { value: "not-an-email", tags: ["invalid-format", "negative"], expectHint: "should_fail" }
          : { value: `<script>@evil.com`, tags: ["xss", "negative"], expectHint: "should_sanitize" };
      }
      if (kind === "boundary") {
        return rng.bool()
          ? { value: "", tags: ["empty", "boundary"], expectHint: "should_fail" }
          : {
              value: `${longString(64)}@example.com`,
              tags: ["very-long", "boundary"],
              expectHint: "should_fail",
            };
      }
      const local = `${firstName(rng, locale).toLowerCase()}.${lastName(rng, locale).toLowerCase()}${rng.int(1, 99)}`;
      return { value: `${local}@example.com`, tags: ["contact"] };
    }

    case "password": {
      if (kind === "invalid") {
        return { value: weakPassword(rng), tags: ["weak", "negative"], expectHint: "should_fail" };
      }
      if (kind === "boundary") {
        return rng.bool()
          ? { value: "a".repeat(3), tags: ["too-short", "boundary"], expectHint: "should_fail" }
          : { value: longString(256, "P"), tags: ["very-long", "boundary"], expectHint: "should_fail" };
      }
      return { value: strongPassword(rng), tags: ["strong", "auth"] };
    }

    case "confirmPassword": {
      if (kind === "invalid") {
        return { value: "mismatch-password!", tags: ["mismatch", "negative"], expectHint: "should_fail" };
      }
      if (kind === "boundary") {
        return { value: "", tags: ["empty", "boundary"], expectHint: "should_fail" };
      }
      return { value: ctx.password ?? strongPassword(rng), tags: ["auth"] };
    }

    case "otp": {
      if (kind === "invalid") {
        return { value: "abcdef", tags: ["non-numeric", "negative"], expectHint: "should_fail" };
      }
      if (kind === "boundary") {
        return rng.bool()
          ? { value: "12", tags: ["too-short", "boundary"], expectHint: "should_fail" }
          : { value: "123456789012", tags: ["too-long", "boundary"], expectHint: "should_fail" };
      }
      return { value: rng.chars("0123456789", 6), tags: ["auth"] };
    }

    case "uuid": {
      if (kind === "invalid") {
        return { value: "not-a-uuid", tags: ["invalid-format", "negative"], expectHint: "should_fail" };
      }
      if (kind === "boundary") {
        return { value: "", tags: ["empty", "boundary"], expectHint: "should_fail" };
      }
      const hex = () => rng.chars("0123456789abcdef", 1);
      const block = (n: number) => Array.from({ length: n }, hex).join("");
      return {
        value: `${block(8)}-${block(4)}-4${block(3)}-${rng.pick(["8", "9", "a", "b"])}${block(3)}-${block(12)}`,
        tags: ["id"],
      };
    }

    case "phone": {
      if (kind === "invalid") {
        return rng.bool()
          ? { value: "12345", tags: ["invalid-format", "negative"], expectHint: "should_fail" }
          : { value: rng.pick(XSS_SAMPLES), tags: ["xss", "negative"], expectHint: "should_sanitize" };
      }
      if (kind === "boundary") {
        return { value: "08", tags: ["too-short", "boundary"], expectHint: "should_fail" };
      }
      const local = `08${rng.chars("1234567890", rng.int(8, 10))}`;
      return {
        value: rng.bool() ? local : `+62${local.slice(1)}`,
        tags: ["contact", "id-phone"],
      };
    }

    case "address": {
      if (kind === "invalid") {
        return { value: rng.pick(SQL_ISH), tags: ["sql-ish", "negative"], expectHint: "should_sanitize" };
      }
      if (kind === "boundary") {
        return { value: longString(500), tags: ["very-long", "boundary"], expectHint: "should_fail" };
      }
      const street = locale === "id" ? "Jl." : "St.";
      return {
        value: `${street} ${rng.pick(["Merdeka", "Sudirman", "Thamrin", "Gatot Subroto"])} No. ${rng.int(1, 200)}`,
        tags: ["location"],
      };
    }

    case "city": {
      if (kind === "invalid") {
        return { value: rng.pick(XSS_SAMPLES), tags: ["xss", "negative"], expectHint: "should_sanitize" };
      }
      if (kind === "boundary") {
        return { value: "", tags: ["empty", "boundary"], expectHint: "should_fail" };
      }
      return { value: rng.pick(CITIES_ID), tags: ["location", "kota"] };
    }

    case "province": {
      if (kind === "invalid") {
        return { value: "Narnia", tags: ["unknown", "negative"], expectHint: "should_fail" };
      }
      if (kind === "boundary") {
        return { value: " ", tags: ["whitespace", "boundary"], expectHint: "should_fail" };
      }
      return { value: rng.pick(PROVINCES_ID), tags: ["location", "provinsi"] };
    }

    case "postalCode": {
      if (kind === "invalid") {
        return { value: "ABCDE", tags: ["non-numeric", "negative"], expectHint: "should_fail" };
      }
      if (kind === "boundary") {
        return { value: "12", tags: ["too-short", "boundary"], expectHint: "should_fail" };
      }
      return { value: rng.chars("1234567890", 5), tags: ["location", "kode-pos"] };
    }

    case "company": {
      if (kind === "invalid") {
        return { value: rng.pick(XSS_SAMPLES), tags: ["xss", "negative"], expectHint: "should_sanitize" };
      }
      if (kind === "boundary") {
        return { value: longString(300), tags: ["very-long", "boundary"], expectHint: "should_fail" };
      }
      return { value: rng.pick(COMPANIES), tags: ["work"] };
    }

    case "job": {
      if (kind === "invalid") {
        return {
          value: rng.pick(UNICODE_SAMPLES) + rng.pick(XSS_SAMPLES),
          tags: ["unicode", "xss", "negative"],
          expectHint: "should_sanitize",
        };
      }
      if (kind === "boundary") {
        return { value: "", tags: ["empty", "boundary"], expectHint: "should_fail" };
      }
      return { value: rng.pick(JOBS), tags: ["work"] };
    }

    case "number": {
      if (kind === "invalid") {
        return { value: "NaN", tags: ["nan", "negative"], expectHint: "should_fail" };
      }
      if (kind === "boundary") {
        return {
          value: rng.pick([-1, 0, 999999999]),
          tags: ["edge-number", "boundary"],
          expectHint: "should_pass",
        };
      }
      return { value: rng.int(1, 10000), tags: ["number"] };
    }

    case "currencyIdr": {
      if (kind === "invalid") {
        return { value: "Rp abc", tags: ["invalid-format", "negative"], expectHint: "should_fail" };
      }
      if (kind === "boundary") {
        return { value: "Rp 0", tags: ["zero", "boundary"], expectHint: "should_pass" };
      }
      const amount = rng.int(10, 5000) * 1000;
      return {
        value: `Rp ${amount.toLocaleString("id-ID")}`,
        tags: ["currency", "idr"],
      };
    }

    case "dateIso": {
      if (kind === "invalid") {
        return { value: "32/13/2026", tags: ["invalid-format", "negative"], expectHint: "should_fail" };
      }
      if (kind === "boundary") {
        return { value: "1970-01-01", tags: ["epoch", "boundary"], expectHint: "should_pass" };
      }
      const y = rng.int(2020, 2026);
      const m = String(rng.int(1, 12)).padStart(2, "0");
      const d = String(rng.int(1, 28)).padStart(2, "0");
      return { value: `${y}-${m}-${d}`, tags: ["date"] };
    }

    case "boolean": {
      if (kind === "invalid") {
        return { value: "maybe", tags: ["invalid-format", "negative"], expectHint: "should_fail" };
      }
      if (kind === "boundary") {
        return { value: "", tags: ["empty", "boundary"], expectHint: "should_fail" };
      }
      return { value: rng.bool(), tags: ["boolean"] };
    }

    case "productName": {
      if (kind === "invalid") {
        return { value: rng.pick(XSS_SAMPLES), tags: ["xss", "negative"], expectHint: "should_sanitize" };
      }
      if (kind === "boundary") {
        return { value: longString(180), tags: ["very-long", "boundary"], expectHint: "should_fail" };
      }
      return { value: rng.pick(PRODUCTS), tags: ["commerce"] };
    }

    case "price": {
      if (kind === "invalid") {
        return { value: -99.99, tags: ["negative-price", "negative"], expectHint: "should_fail" };
      }
      if (kind === "boundary") {
        return { value: 0, tags: ["zero", "boundary"], expectHint: "should_fail" };
      }
      return { value: Number((rng.int(1000, 999999) / 100).toFixed(2)), tags: ["commerce"] };
    }

    case "qty": {
      if (kind === "invalid") {
        return { value: -1, tags: ["negative-qty", "negative"], expectHint: "should_fail" };
      }
      if (kind === "boundary") {
        return { value: rng.pick([0, 9999]), tags: ["edge-qty", "boundary"], expectHint: "should_fail" };
      }
      return { value: rng.int(1, 20), tags: ["commerce"] };
    }

    case "searchQuery": {
      if (kind === "invalid") {
        return rng.bool()
          ? { value: rng.pick(SQL_ISH), tags: ["sql-ish", "negative"], expectHint: "should_sanitize" }
          : { value: rng.pick(XSS_SAMPLES), tags: ["xss", "negative"], expectHint: "should_sanitize" };
      }
      if (kind === "boundary") {
        return rng.bool()
          ? { value: "", tags: ["empty", "boundary"], expectHint: "should_fail" }
          : {
              value: `${rng.pick(EMOJI)} ${longString(300)}`,
              tags: ["emoji", "very-long", "boundary"],
              expectHint: "should_fail",
            };
      }
      const queries =
        locale === "id"
          ? ["laptop gaming", "kemeja putih", "sepatu lari", "charger tipe c"]
          : ["wireless mouse", "blue hoodie", "running shoes", "usb-c charger"];
      return { value: rng.pick(queries), tags: ["search"] };
    }

    default:
      return { value: "", tags: ["unknown"] };
  }
}

export function defaultExpect(kind: CaseKind): ExpectHint {
  if (kind === "valid") return "should_pass";
  if (kind === "boundary") return "should_fail";
  return "should_fail";
}
