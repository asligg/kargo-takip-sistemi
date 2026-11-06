import type { RoutePoint } from "@/components/shipment/route-map";
import { getBranch } from "./data";
import type { Shipment } from "./types";

/** Durum geçmişindeki şubelerden harita noktalarını üretir; varış şubesine henüz ulaşılmadıysa onu da ekler. */
export function routePoints(s: Shipment): RoutePoint[] {
  const ids: string[] = [];
  for (const e of s.history) {
    if (e.branchId && ids.at(-1) !== e.branchId) ids.push(e.branchId);
  }
  const points: RoutePoint[] = ids
    .map((id) => getBranch(id))
    .filter((b) => !!b)
    .map((b) => ({ name: b.name, lat: b.lat, lng: b.lng, reached: true }));
  if (!ids.includes(s.destBranchId)) {
    const dest = getBranch(s.destBranchId);
    if (dest) points.push({ name: dest.name, lat: dest.lat, lng: dest.lng, reached: false });
  }
  return points;
}
