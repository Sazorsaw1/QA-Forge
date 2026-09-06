export const FIRST_NAMES_EN = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn",
  "Sam", "Jamie", "Cameron", "Drew", "Harper", "Reese", "Skyler", "Blake",
] as const;

export const LAST_NAMES_EN = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Wilson", "Anderson", "Thomas", "Moore", "Jackson", "Martin", "Lee", "Clark",
] as const;

export const FIRST_NAMES_ID = [
  "Budi", "Siti", "Andi", "Dewi", "Agus", "Rina", "Eko", "Putri",
  "Joko", "Maya", "Rizki", "Ayu", "Dimas", "Lestari", "Fajar", "Indah",
] as const;

export const LAST_NAMES_ID = [
  "Santoso", "Wijaya", "Kusuma", "Pratama", "Saputra", "Hidayat", "Nugroho",
  "Wibowo", "Suryadi", "Gunawan", "Halim", "Tanaka", "Permata", "Mahendra",
  "Sari", "Utami",
] as const;

export const CITIES_ID = [
  "Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar",
  "Yogyakarta", "Denpasar", "Palembang", "Balikpapan", "Malang", "Bogor",
] as const;

export const PROVINCES_ID = [
  "DKI Jakarta", "Jawa Barat", "Jawa Timur", "Jawa Tengah", "Banten",
  "Sumatera Utara", "Sulawesi Selatan", "Bali", "Sumatera Selatan",
  "Kalimantan Timur", "DI Yogyakarta", "Aceh",
] as const;

export const COMPANIES = [
  "Nusantara Labs", "Garuda Soft", "Merah Putih Tech", "Cahaya Digital",
  "Bintang Systems", "Samudra Cloud", "Padi Analytics", "Kopi Kode",
] as const;

export const JOBS = [
  "QA Engineer", "Software Developer", "Product Manager", "UI Designer",
  "DevOps Engineer", "Data Analyst", "Scrum Master", "Support Specialist",
] as const;

export const PRODUCTS = [
  "Wireless Mouse", "USB-C Hub", "Mechanical Keyboard", "Noise Cancelling Headset",
  "Laptop Stand", "Portable SSD", "Webcam HD", "Smart Plug",
] as const;

export const XSS_SAMPLES = [
  '<script>alert("xss")</script>',
  '"><img src=x onerror=alert(1)>',
  "<svg onload=alert(1)>",
  "javascript:alert(1)",
] as const;

export const SQL_ISH = [
  "' OR '1'='1",
  "1; DROP TABLE users;--",
  "admin'--",
  "' UNION SELECT * FROM users--",
] as const;

export const EMOJI = ["🔥", "🧪", "✅", "🚀", "😈", "🇮🇩", "👋", "💡"] as const;

export const UNICODE_SAMPLES = [
  "café résumé naïve",
  "東京テスト",
  "مرحبا",
  "Здравствуйте",
  "नमस्ते",
] as const;
