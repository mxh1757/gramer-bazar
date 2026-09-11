export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function normalizePhone(v: string): string {
  return (v || "").replace(/[\s\-()]/g, "");
}

export function isValidPhone(v: string): boolean {
  return /^01\d{9}$/.test(normalizePhone(v));
}

export function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || "").trim());
}