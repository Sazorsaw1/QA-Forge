export type Locale = "en" | "id";
export type Mode = "valid" | "boundary" | "invalid" | "mixed";
export type CaseKind = "valid" | "boundary" | "invalid";
export type ExpectHint = "should_pass" | "should_fail" | "should_sanitize";

export type PackId =
  | "login"
  | "signup"
  | "checkout"
  | "profile"
  | "search"
  | "custom";

export type FieldId =
  | "firstName"
  | "lastName"
  | "fullName"
  | "username"
  | "bio"
  | "email"
  | "password"
  | "otp"
  | "uuid"
  | "phone"
  | "address"
  | "city"
  | "province"
  | "postalCode"
  | "company"
  | "job"
  | "number"
  | "currencyIdr"
  | "dateIso"
  | "boolean"
  | "productName"
  | "price"
  | "qty"
  | "searchQuery"
  | "confirmPassword";

export interface GenerateOptions {
  locale: Locale;
  seed: number;
  count: number;
  mode: Mode;
  pack: PackId;
  customFields: FieldId[];
}

export interface GeneratedRow {
  id: string;
  case: CaseKind;
  tags: string[];
  expectHint: ExpectHint;
  [key: string]: string | number | boolean | string[] | CaseKind | ExpectHint;
}

export const ALL_FIELDS: { id: FieldId; label: string }[] = [
  { id: "firstName", label: "First name" },
  { id: "lastName", label: "Last name" },
  { id: "fullName", label: "Full name" },
  { id: "username", label: "Username" },
  { id: "bio", label: "Bio" },
  { id: "email", label: "Email" },
  { id: "password", label: "Password" },
  { id: "confirmPassword", label: "Confirm password" },
  { id: "otp", label: "OTP" },
  { id: "uuid", label: "UUID" },
  { id: "phone", label: "Phone (ID)" },
  { id: "address", label: "Address" },
  { id: "city", label: "City (kota)" },
  { id: "province", label: "Province (provinsi)" },
  { id: "postalCode", label: "Postal code" },
  { id: "company", label: "Company" },
  { id: "job", label: "Job title" },
  { id: "number", label: "Number" },
  { id: "currencyIdr", label: "IDR currency" },
  { id: "dateIso", label: "Date (ISO)" },
  { id: "boolean", label: "Boolean" },
  { id: "productName", label: "Product name" },
  { id: "price", label: "Price" },
  { id: "qty", label: "Quantity" },
  { id: "searchQuery", label: "Search query" },
];

export const PACK_FIELDS: Record<Exclude<PackId, "custom">, FieldId[]> = {
  login: ["email", "password"],
  signup: ["fullName", "username", "email", "password", "confirmPassword", "phone"],
  checkout: ["fullName", "email", "phone", "address", "city", "province", "postalCode", "productName", "price", "qty"],
  profile: ["firstName", "lastName", "username", "bio", "email", "phone", "company", "job", "city"],
  search: ["searchQuery"],
};
