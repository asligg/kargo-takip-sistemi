/**
 * Yeşil Kargo: karbon ayak izi tahmini, yeşil teslimat günü ve yeşil puan kuralları.
 * Saf fonksiyonlardan oluşur; hem sunucu hem tarayıcı tarafında kullanılabilir.
 *
 * Katsayılar yaklaşık değerlerdir (tahmini gösterim amaçlı):
 * - Şehirler arası taşıma: kamyon ile ton-km başına ~0,11 kg CO₂
 * - Son kilometre (kuryenin adrese gidişi): teslimat başına ~0,55 kg CO₂ (hafif ticari araç)
 */
import type { Branch, DeliveryOption } from "./types";

const LINEHAUL_KG_PER_TKM = 0.11;
const ROAD_FACTOR = 1.25; // kuş uçuşu mesafeden karayolu mesafesine
export const LAST_MILE_KG = 0.55;

/** Teslimat tercihine göre son kilometrede tasarruf edilen pay */
export const SAVING_RATIO: Record<DeliveryOption, number> = {
  ADRES: 0,
  BASKA_GUN: 0,
  KOMSU: 0,
  SUBEDEN: 1, // kurye adrese hiç gitmez
  YESIL_GUN: 0.65, // aynı sokağa tek seferde toplu dağıtım
};

/** Teslimatta alıcıya verilen yeşil puan */
export const GREEN_POINTS: Record<DeliveryOption, number> = {
  ADRES: 0,
  BASKA_GUN: 0,
  KOMSU: 0,
  SUBEDEN: 15,
  YESIL_GUN: 10,
};

/** 10 yeşil puan = 1 TL; indirim gönderi ücretinin en fazla %20'si olabilir */
export const POINTS_PER_TL = 10;
export const MAX_DISCOUNT_RATIO = 0.2;

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export interface Co2Estimate {
  km: number;
  linehaul: number;
  lastMile: number;
  total: number;
  saved: number;
}

/** Gönderinin tahmini karbon ayak izi (kg CO₂) */
export function estimateCo2(origin: Branch, dest: Branch, weightKg: number, desi: number, option: DeliveryOption = "ADRES"): Co2Estimate {
  const km = Math.max(haversineKm(origin, dest) * ROAD_FACTOR, 10);
  const tons = Math.max(weightKg, desi) / 1000;
  const linehaul = km * tons * LINEHAUL_KG_PER_TKM;
  const saved = LAST_MILE_KG * SAVING_RATIO[option];
  const lastMile = LAST_MILE_KG - saved;
  return { km: Math.round(km), linehaul, lastMile, total: linehaul + lastMile, saved };
}

export const formatKg = (kg: number) => `${kg.toLocaleString("tr-TR", { maximumFractionDigits: kg < 10 ? 2 : 0 })} kg`;

/** Kullanılabilecek en yüksek puan indirimi */
export function maxDiscount(points: number, price: number): { tl: number; points: number } {
  const tl = Math.min(Math.floor(points / POINTS_PER_TL), Math.floor(price * MAX_DISCOUNT_RATIO));
  return { tl, points: tl * POINTS_PER_TL };
}

/* ---------------- Yeşil teslimat günü ---------------- */

export const WEEKDAY = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

/** Şubenin toplu dağıtım günü (tanımlı değilse şube koduna göre Pazartesi–Cuma arasından sabit bir gün) */
export function greenDayOf(branch: Branch): number {
  if (branch.greenDay) return branch.greenDay;
  let h = 0;
  for (const c of branch.id) h = (h * 31 + c.charCodeAt(0)) % 997;
  return (h % 5) + 1;
}

/** "YYYY-MM-DD" (yerel tarih) */
export const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Yarından itibaren şubenin ilk yeşil teslimat günü */
export function nextGreenDate(branch: Branch, from = new Date()): string {
  const day = greenDayOf(branch);
  const d = new Date(from);
  do d.setDate(d.getDate() + 1);
  while (d.getDay() !== day);
  return isoDay(d);
}

/** Yarından itibaren seçilebilecek iş günleri (BASKA_GUN seçeneği için) */
export function nextWorkdays(count = 5, from = new Date()): string[] {
  const out: string[] = [];
  const d = new Date(from);
  while (out.length < count) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) out.push(isoDay(d));
  }
  return out;
}
