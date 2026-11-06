const TZ = "Europe/Istanbul";

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: TZ }).format(new Date(iso));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: TZ }).format(new Date(iso));
}

/** "2026-11-12" → "12 Kasım Perşembe" */
export function formatDayLabel(day: string): string {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", weekday: "long", timeZone: TZ }).format(new Date(day));
}

/** Gizlilik (NFR-09): takip sorgusunda kişi adları maskelenir. "Ayşe Yılmaz" -> "Ay*** Yı***" */
export function maskName(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p.slice(0, 2) + "***")
    .join(" ");
}

export function normalizeTrackingNo(v: string): string {
  return v.replace(/\s+/g, "").toUpperCase();
}

export const TRACKING_RE = /^KT\d{10}$/;
