import type { TariffRow } from "./types";

/** Varsayılan ücret tarifesi (yönetici panelinden güncellenebilir) */
export const DEFAULT_TARIFF: TariffRow[] = [
  { id: "t1", label: "Dosya / 0–1 desi", minDesi: 0, maxDesi: 1, price: 85 },
  { id: "t2", label: "1–5 desi", minDesi: 1, maxDesi: 5, price: 120 },
  { id: "t3", label: "5–10 desi", minDesi: 5, maxDesi: 10, price: 165 },
  { id: "t4", label: "10–20 desi", minDesi: 10, maxDesi: 20, price: 240 },
  { id: "t5", label: "20–30 desi", minDesi: 20, maxDesi: 30, price: 320 },
  { id: "t6", label: "30 desi üzeri (desi başı ek)", minDesi: 30, maxDesi: null, price: 11 },
];

/** Şehir dışı gönderilerde uygulanan ek oran */
export const INTERCITY_RATE = 0.25;

/** Desi = en × boy × yükseklik (cm) / 3000 */
export function calcDesi(w: number, h: number, l: number): number {
  if (!w || !h || !l) return 0;
  return Math.round(((w * h * l) / 3000) * 10) / 10;
}

export interface PriceBreakdown {
  billable: number;
  base: number;
  intercity: number;
  total: number;
  row: TariffRow;
}

/** Ücretlendirmede ağırlık (kg) ile desiden büyük olan esas alınır */
export function calcPrice(
  weightKg: number,
  desi: number,
  sameCity: boolean,
  tariff: TariffRow[] = DEFAULT_TARIFF,
): PriceBreakdown {
  const billable = Math.max(weightKg || 0, desi || 0);
  const rows = [...tariff].sort((a, b) => a.minDesi - b.minDesi);
  const open = rows.find((r) => r.maxDesi === null)!;
  const row = rows.find((r) => r.maxDesi !== null && billable <= r.maxDesi) ?? open;

  let base = row.price;
  if (row.maxDesi === null) {
    const lastFixed = rows.filter((r) => r.maxDesi !== null).at(-1)!;
    base = lastFixed.price + Math.ceil(billable - row.minDesi) * row.price;
  }
  const intercity = sameCity ? 0 : Math.round(base * INTERCITY_RATE);
  return { billable, base, intercity, total: base + intercity, row };
}

export function formatTL(n: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 }).format(n);
}
