/**
 * Kurye rota optimizasyonu (anahtarsız sürüm).
 * Durakların sırası kuş uçuşu mesafeyle "en yakın komşu" + "2-opt" sezgiselleri kullanılarak bulunur;
 * yol tarifi için duraklar sırasıyla Google Haritalar navigasyon bağlantısına aktarılır (API anahtarı gerekmez).
 */
import { haversineKm } from "./green";
import type { Branch, Shipment } from "./types";

/** Hafif ticari araç (kurye) için km başına yaklaşık CO₂ salımı */
export const VAN_KG_PER_KM = 0.25;

/** Koordinatı girilmemiş adresler için ilçe merkezleri (gerçek sistemde adres servisiyle bulunur) */
const DISTRICT_CENTER: Record<string, [number, number]> = {
  "İstanbul/Kadıköy": [40.9906, 29.029],
  "İstanbul/Beşiktaş": [41.0428, 29.0075],
  "Ankara/Çankaya": [39.9179, 32.8627],
  "İzmir/Konak": [38.4189, 27.1287],
  "Sivas/Merkez": [39.7477, 37.0179],
  "Kayseri/Kocasinan": [38.7438, 35.4719],
  "Bursa/Nilüfer": [40.2133, 28.9786],
  "Antalya/Muratpaşa": [36.8841, 30.7056],
  "Konya/Selçuklu": [37.9493, 32.4974],
  "Samsun/İlkadım": [41.2867, 36.33],
  "Trabzon/Ortahisar": [41.0027, 39.7168],
};

export interface Point {
  lat: number;
  lng: number;
}

export interface Stop extends Point {
  shipment: Shipment;
  /** Konum adresten mi geldi, yoksa ilçe merkezi mi kullanıldı */
  approximate: boolean;
}

export function stopOf(s: Shipment, dest: Branch): Stop {
  const r = s.receiver;
  if (r.lat !== undefined && r.lng !== undefined) return { shipment: s, lat: r.lat, lng: r.lng, approximate: false };
  const c = DISTRICT_CENTER[`${r.city}/${r.district}`];
  return { shipment: s, lat: c?.[0] ?? dest.lat, lng: c?.[1] ?? dest.lng, approximate: true };
}

/** Şubeden başlayıp durakları verilen sırayla dolaşan yolun uzunluğu (km) */
export function pathKm(start: Point, stops: Point[]): number {
  let km = 0;
  let prev = start;
  for (const p of stops) {
    km += haversineKm(prev, p);
    prev = p;
  }
  return km;
}

/** En yakın komşu: her adımda henüz gidilmemiş en yakın durağa git */
function nearestNeighbor<T extends Point>(start: Point, stops: T[]): T[] {
  const left = [...stops];
  const out: T[] = [];
  let cur: Point = start;
  while (left.length) {
    let best = 0;
    for (let i = 1; i < left.length; i++) if (haversineKm(cur, left[i]) < haversineKm(cur, left[best])) best = i;
    cur = left.splice(best, 1)[0];
    out.push(cur as T);
  }
  return out;
}

/** 2-opt: rotada bir bölümü ters çevirmek yolu kısaltıyorsa çevir (birbirini kesen yolları düzeltir) */
function twoOpt<T extends Point>(start: Point, route: T[]): T[] {
  let best = route;
  let bestKm = pathKm(start, best);
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < best.length - 1; i++) {
      for (let j = i + 1; j < best.length; j++) {
        const candidate = [...best.slice(0, i), ...best.slice(i, j + 1).reverse(), ...best.slice(j + 1)];
        const km = pathKm(start, candidate);
        if (km < bestKm - 1e-9) {
          best = candidate;
          bestKm = km;
          improved = true;
        }
      }
    }
  }
  return best;
}

export interface CourierRoute {
  start: Point;
  stops: Stop[];
  km: number;
  /** Atanma sırasıyla gidilseydi */
  baselineKm: number;
  savedKm: number;
  savedCo2: number;
}

/** Kuryenin dağıtımdaki gönderileri için en kısa durak sırası */
export function optimizeCourierRoute(branch: Branch, shipments: Shipment[]): CourierRoute {
  const start = { lat: branch.lat, lng: branch.lng };
  const assigned = shipments.map((s) => stopOf(s, branch));
  const stops = twoOpt(start, nearestNeighbor(start, assigned));
  const km = pathKm(start, stops);
  const baselineKm = pathKm(start, assigned);
  const savedKm = Math.max(0, baselineKm - km);
  return { start, stops, km, baselineKm, savedKm, savedCo2: savedKm * VAN_KG_PER_KM };
}

/* ---------------- Google Haritalar navigasyon bağlantıları ---------------- */

const ll = (p: Point) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;

/** Mobil Google Haritalar bir bağlantıda en fazla 9 ara durak kabul eder */
export const MAX_WAYPOINTS = 9;

/**
 * Durakları sırasıyla Google Haritalar'da açan bağlantılar.
 * 10'dan fazla durak varsa rota parçalara bölünür; her parça bir öncekinin son durağından başlar.
 */
export function googleMapsLinks(start: Point, stops: Point[]): { from: number; to: number; url: string }[] {
  const links: { from: number; to: number; url: string }[] = [];
  let origin = start;
  for (let i = 0; i < stops.length; i += MAX_WAYPOINTS + 1) {
    const part = stops.slice(i, i + MAX_WAYPOINTS + 1);
    const dest = part.at(-1)!;
    const params = new URLSearchParams({ api: "1", origin: ll(origin), destination: ll(dest), travelmode: "driving" });
    if (part.length > 1) params.set("waypoints", part.slice(0, -1).map(ll).join("|"));
    links.push({ from: i + 1, to: i + part.length, url: `https://www.google.com/maps/dir/?${params}` });
    origin = dest;
  }
  return links;
}

/** Yalnızca tek bir durağa navigasyon (başlangıç: kuryenin bulunduğu konum) */
export const googleMapsTo = (p: Point) => `https://www.google.com/maps/dir/?${new URLSearchParams({ api: "1", destination: ll(p), travelmode: "driving" })}`;
